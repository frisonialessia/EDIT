import type { Event, EventId, RiskSignal, WorkflowProposalId } from '@edit-os/core';
import { EventNotFoundError } from './errors.js';
import { WorkflowProposalNotFoundError } from './errors.js';
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

export interface DominoOrchestratorDeps {
  readonly events: IEventRepository;
  readonly sensors: readonly ISensorProvider[];
}

export class DominoOrchestrator {
  constructor(private readonly deps: DominoOrchestratorDeps) {}

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

      const trafficResult = evaluateTrafficRule(updated, signal, now);
      if (trafficResult) {
        newProposals.push(trafficResult.proposal);
        updated = {
          ...updated,
          timeline: trafficResult.timeline,
          pendingProposals: newProposals,
        };
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

    const updatedProposals = event.pendingProposals.map((p) =>
      p.id === proposalId ? { ...p, status: 'approved' as const } : p,
    );

    return this.deps.events.update({
      ...event,
      activePlan: proposal.planB.variant,
      timeline: proposal.planB.blocks,
      pendingProposals: updatedProposals.filter((p) => p.status === 'pending'),
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
