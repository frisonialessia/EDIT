import type { EventId, WorkflowProposalId } from '@edit-os/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { DominoOrchestrator } from './domino-orchestrator.js';
import { WorkflowProposalNotFoundError } from './errors.js';
import { createComoVillaGalaEvent, initialWeatherProposal } from './fixtures/como-villa-gala.js';
import { InMemoryEventRepository } from './repositories.memory.js';
import { createDefaultSensorProviders } from './sensors/index.js';

function asEventId(id: string): EventId {
  return id as EventId;
}

function asProposalId(id: string): WorkflowProposalId {
  return id as WorkflowProposalId;
}

describe('DominoOrchestrator', () => {
  let events: InMemoryEventRepository;
  let orchestrator: DominoOrchestrator;

  beforeEach(async () => {
    events = new InMemoryEventRepository();
    orchestrator = new DominoOrchestrator({
      events,
      sensors: createDefaultSensorProviders(),
    });
    await events.create(createComoVillaGalaEvent());
  });

  it('refreshes risk signals from sensor layer', async () => {
    const result = await orchestrator.evaluateEvent(asEventId('event-1'));

    expect(result.riskProfile.signals.length).toBeGreaterThanOrEqual(2);
    expect(result.riskProfile.signals.some((s) => s.category === 'weather')).toBe(true);
    expect(result.riskProfile.signals.some((s) => s.category === 'traffic')).toBe(true);
  });

  it('approves a proposal and activates Plan B timeline', async () => {
    const result = await orchestrator.approveProposal(
      asEventId('event-1'),
      initialWeatherProposal.id,
    );

    expect(result.activePlan).toBe('B');
    expect(result.timeline.every((b) => b.planVariant === 'B')).toBe(true);
    expect(result.pendingProposals).toHaveLength(0);
  });

  it('throws when approving a missing proposal', async () => {
    await expect(
      orchestrator.approveProposal(asEventId('event-1'), asProposalId('missing')),
    ).rejects.toBeInstanceOf(WorkflowProposalNotFoundError);
  });
});
