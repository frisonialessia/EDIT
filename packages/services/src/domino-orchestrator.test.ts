import type { EventId, WorkflowProposalId } from '@edit-os/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { DominoOrchestrator } from './domino-orchestrator.js';
import { WorkflowProposalNotFoundError } from './errors.js';
import { createComoVillaGalaEvent, initialWeatherProposal } from './fixtures/como-villa-gala.js';
import { InMemoryMessageRepository } from './messaging.repository.js';
import { PolicyEngine } from './policy-engine.js';
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
  let messages: InMemoryMessageRepository;
  let orchestrator: DominoOrchestrator;

  beforeEach(async () => {
    events = new InMemoryEventRepository();
    messages = new InMemoryMessageRepository();
    orchestrator = new DominoOrchestrator({
      events,
      messages,
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

  it('creates traffic proposal without auto-approve when compound conditions are not met', async () => {
    await events.update(
      createComoVillaGalaEvent({
        pendingProposals: [],
        isOutdoor: false,
        riskProfile: {
          signals: [
            {
              category: 'traffic',
              level: 'high',
              value: 25,
              unit: 'min',
              message: 'Delay',
              detectedAt: new Date().toISOString(),
            },
          ],
        },
      }),
    );

    const before = await events.findById(asEventId('event-1'));
    const result = await orchestrator.evaluateEvent(asEventId('event-1'));

    expect(result.timeline).toEqual(before!.timeline);
    expect(result.pendingProposals.some((p) => p.trigger === 'traffic')).toBe(true);
  });

  it('approves a proposal, activates Plan B, executes actions, and records history', async () => {
    const result = await orchestrator.approveProposal(
      asEventId('event-1'),
      initialWeatherProposal.id,
    );

    expect(result.activePlan).toBe('B');
    expect(result.timeline.every((b) => b.planVariant === 'B')).toBe(true);
    expect(result.pendingProposals).toHaveLength(0);
    expect(result.actionHistory.length).toBe(initialWeatherProposal.actions.length);
    expect(result.actionHistory.every((r) => r.status === 'completed')).toBe(true);

    const cateringMessages = await messages.listMessages(asEventId('event-1'), 'thread-catering');
    expect(cateringMessages.some((m) => m.senderName === 'EDIT-OS Orchestrator')).toBe(true);
  });

  it('throws when approving a missing proposal', async () => {
    await expect(
      orchestrator.approveProposal(asEventId('event-1'), asProposalId('missing')),
    ).rejects.toBeInstanceOf(WorkflowProposalNotFoundError);
  });

  it('auto-approves compound crisis proposals during evaluate', async () => {
    const policies = new PolicyEngine();
    const autoOrchestrator = new DominoOrchestrator({
      events,
      messages,
      sensors: createDefaultSensorProviders(),
      policies,
    });

    await events.update(
      createComoVillaGalaEvent({
        pendingProposals: [],
      }),
    );

    const result = await autoOrchestrator.evaluateEvent(asEventId('event-1'));

    expect(result.pendingProposals).toHaveLength(0);
    expect(result.activePlan).toBe('B');
    expect(result.orchestrationLogs.some((l) => l.decision === 'auto_approved')).toBe(true);
    expect(result.actionHistory.length).toBeGreaterThan(0);
  });
});
