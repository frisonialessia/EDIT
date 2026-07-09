import type { Event, EventId, OrchestrationLog, RiskSignal, WorkflowProposalId } from '@edit-os/core';
import type { DocumentService } from './document.service.js';
import { ActionExecutor } from './action-executor.js';
import { EventNotFoundError } from './errors.js';
import { WorkflowProposalNotFoundError } from './errors.js';
import type { IMessageRepository } from './messaging.repository.js';
import { PolicyEngine } from './policy-engine.js';
import type { IEventRepository } from './repository.js';
import {
  evaluateAmbientRule,
  evaluateCompoundRule,
  evaluateConsumptionRule,
  evaluateGuestFlowRule,
  evaluateStaffRule,
  evaluateTrafficRule,
  evaluateWeatherRule,
  signalsFromReadings,
} from './rules/orchestration-rules.js';
import type { ISensorProvider, SensorContext } from './sensors/types.js';
import { applyShiftActions } from './timeline-engine.js';

export interface DominoOrchestratorDeps {
  readonly events: IEventRepository;
  readonly sensors: readonly ISensorProvider[];
  readonly messages: IMessageRepository;
  readonly documents?: DocumentService;
  readonly policies?: PolicyEngine;
}

export class DominoOrchestrator {
  private readonly actionExecutor: ActionExecutor;
  private readonly policyEngine: PolicyEngine;

  constructor(private readonly deps: DominoOrchestratorDeps) {
    this.actionExecutor = new ActionExecutor({ messages: deps.messages });
    this.policyEngine = deps.policies ?? new PolicyEngine();
  }

  getPolicyEngine(): PolicyEngine {
    return this.policyEngine;
  }

  async evaluateEvent(eventId: EventId): Promise<Event> {
    const event = await this.deps.events.findById(eventId);
    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    const context: SensorContext = {
      eventId: event.id,
      location: event.location,
      isOutdoor: event.isOutdoor,
      date: event.date,
    };

    const now = new Date().toISOString();
    const readings = (
      await Promise.all(this.deps.sensors.map((sensor) => sensor.poll(context)))
    ).filter((reading): reading is NonNullable<typeof reading> => reading !== null);

    const signals: RiskSignal[] = signalsFromReadings(readings, now);
    const thresholds = this.policyEngine.getThresholds();
    const policy = this.policyEngine.getPolicy();

    let updated: Event = { ...event, riskProfile: { signals } };
    const newProposals = [...updated.pendingProposals];
    const skipCategories = new Set<RiskSignal['category']>();

    if (policy.compoundRulesEnabled) {
      const compoundProposal = evaluateCompoundRule(updated, signals, thresholds, now);
      if (compoundProposal) {
        newProposals.push(compoundProposal);
        updated = { ...updated, pendingProposals: newProposals };
        skipCategories.add('weather');
        skipCategories.add('traffic');
        this.policyEngine.recordLog({
          id: `log-${Date.now()}-compound`,
          eventId,
          trigger: 'compound',
          decision: 'proposed',
          actor: 'domino-orchestrator',
          reason: compoundProposal.reason,
          proposalId: compoundProposal.id,
          timestamp: now,
        });
      }
    }

    for (const signal of signals) {
      if (skipCategories.has(signal.category)) {
        continue;
      }

      const ruleEvaluators = [
        evaluateWeatherRule,
        evaluateTrafficRule,
        evaluateStaffRule,
        evaluateGuestFlowRule,
        evaluateConsumptionRule,
        evaluateAmbientRule,
      ] as const;

      for (const evaluate of ruleEvaluators) {
        const proposal = evaluate(updated, signal, now, thresholds);
        if (proposal) {
          newProposals.push(proposal);
          updated = { ...updated, pendingProposals: newProposals };
          this.policyEngine.recordLog({
            id: `log-${Date.now()}-${proposal.trigger}`,
            eventId,
            trigger: proposal.trigger,
            decision: 'proposed',
            actor: 'domino-orchestrator',
            reason: proposal.reason,
            proposalId: proposal.id,
            timestamp: now,
          });
        }
      }
    }

    updated = await this.deps.events.update(updated);

    const autoApproveIds = updated.pendingProposals
      .filter((proposal) => this.policyEngine.shouldAutoApprove(proposal, updated, signals))
      .map((proposal) => proposal.id);

    for (const proposalId of autoApproveIds) {
      updated = await this.approveProposal(eventId, proposalId, 'policy-engine');
    }

    return updated;
  }

  async approveProposal(
    eventId: EventId,
    proposalId: WorkflowProposalId,
    actor = 'manual',
  ): Promise<Event> {
    const event = await this.deps.events.findById(eventId);
    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    const proposal = event.pendingProposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new WorkflowProposalNotFoundError(eventId, proposalId);
    }

    const baseTimeline =
      proposal.planB.blocks.length > 0 ? [...proposal.planB.blocks] : [...event.timeline];

    const shouldApplyShiftActions =
      proposal.actions.some((a) => a.type === 'shift_timeline') &&
      proposal.trigger !== 'weather' &&
      proposal.trigger !== 'traffic' &&
      proposal.trigger !== 'compound';

    const timeline = shouldApplyShiftActions
      ? applyShiftActions(baseTimeline, proposal.actions)
      : baseTimeline;

    const eventWithTimeline: Event = {
      ...event,
      activePlan: proposal.planB.variant,
      timeline,
    };

    const executionRecords = await this.actionExecutor.execute(eventWithTimeline, proposal.actions);

    const updatedProposals = event.pendingProposals.map((p) =>
      p.id === proposalId ? { ...p, status: 'approved' as const } : p,
    );

    const logEntry: OrchestrationLog = {
      id: `log-${Date.now()}-approve`,
      eventId,
      trigger: proposal.trigger,
      decision: actor === 'policy-engine' ? 'auto_approved' : 'manual_approved',
      actor,
      reason: proposal.reason,
      proposalId,
      timestamp: new Date().toISOString(),
    };

    this.policyEngine.recordLog(logEntry);

    const updated = await this.deps.events.update({
      ...eventWithTimeline,
      pendingProposals: updatedProposals.filter((p) => p.status === 'pending'),
      actionHistory: [...event.actionHistory, ...executionRecords],
      orchestrationLogs: [...event.orchestrationLogs, logEntry],
    });

    if (this.deps.documents && proposal.planB.variant === 'B') {
      await this.deps.documents
        .archivePlanBSnapshot(eventId, proposal.planB.label, proposal.reason)
        .catch(() => undefined);
    }

    return updated;
  }

  async rejectProposal(eventId: EventId, proposalId: WorkflowProposalId): Promise<Event> {
    const event = await this.deps.events.findById(eventId);
    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    const proposal = event.pendingProposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new WorkflowProposalNotFoundError(eventId, proposalId);
    }

    const updatedProposals = event.pendingProposals.map((p) =>
      p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
    );

    const logEntry: OrchestrationLog = {
      id: `log-${Date.now()}-reject`,
      eventId,
      trigger: proposal.trigger,
      decision: 'rejected',
      actor: 'manual',
      reason: proposal.reason,
      proposalId,
      timestamp: new Date().toISOString(),
    };

    this.policyEngine.recordLog(logEntry);

    return this.deps.events.update({
      ...event,
      pendingProposals: updatedProposals.filter((p) => p.status === 'pending'),
      orchestrationLogs: [...event.orchestrationLogs, logEntry],
    });
  }
}
