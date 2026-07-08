import type { Event, EventId, RiskSignal, WorkflowProposalId } from '@edit-os/core';
import { ActionExecutor } from './action-executor.js';
import { EventNotFoundError } from './errors.js';
import { WorkflowProposalNotFoundError } from './errors.js';
import type { IMessageRepository } from './messaging.repository.js';
import type { IEventRepository } from './repository.js';
import {
  evaluateAmbientRule,
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
}

export class DominoOrchestrator {
  private readonly actionExecutor: ActionExecutor;

  constructor(private readonly deps: DominoOrchestratorDeps) {
    this.actionExecutor = new ActionExecutor({ messages: deps.messages });
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
    let updated: Event = { ...event, riskProfile: { signals } };
    const newProposals = [...updated.pendingProposals];

    for (const signal of signals) {
      const weatherProposal = evaluateWeatherRule(updated, signal, now);
      if (weatherProposal) {
        newProposals.push(weatherProposal);
        updated = { ...updated, pendingProposals: newProposals };
      }

      const trafficProposal = evaluateTrafficRule(updated, signal, now);
      if (trafficProposal) {
        newProposals.push(trafficProposal);
        updated = { ...updated, pendingProposals: newProposals };
      }

      for (const evaluate of [
        evaluateStaffRule,
        evaluateGuestFlowRule,
        evaluateConsumptionRule,
        evaluateAmbientRule,
      ]) {
        const proposal = evaluate(updated, signal, now);
        if (proposal) {
          newProposals.push(proposal);
          updated = { ...updated, pendingProposals: newProposals };
        }
      }
    }

    return this.deps.events.update(updated);
  }

  async approveProposal(eventId: EventId, proposalId: WorkflowProposalId): Promise<Event> {
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
      proposal.trigger !== 'traffic';

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

    return this.deps.events.update({
      ...eventWithTimeline,
      pendingProposals: updatedProposals.filter((p) => p.status === 'pending'),
      actionHistory: [...event.actionHistory, ...executionRecords],
    });
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

    return this.deps.events.update({
      ...event,
      pendingProposals: updatedProposals.filter((p) => p.status === 'pending'),
    });
  }
}
