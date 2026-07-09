import type { EventId } from '@edit-os/core';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { DominoOrchestrator } from './domino-orchestrator.js';
import { EvaluationScheduler } from './evaluation-scheduler.js';
import { createComoVillaGalaEvent } from './fixtures/como-villa-gala.js';
import { InMemoryMessageRepository } from './messaging.repository.js';
import { InMemoryEventRepository } from './repositories.memory.js';
import { createDefaultSensorProviders } from './sensors/index.js';

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

describe('EvaluationScheduler', () => {
  let events: InMemoryEventRepository;
  let domino: DominoOrchestrator;
  let scheduler: EvaluationScheduler;

  beforeEach(async () => {
    events = new InMemoryEventRepository();
    domino = new DominoOrchestrator({
      events,
      messages: new InMemoryMessageRepository(),
      sensors: createDefaultSensorProviders(),
    });
    scheduler = new EvaluationScheduler({ events, domino, intervalMs: 10_000 });

    await events.create(
      createComoVillaGalaEvent({
        id: 'event-scheduler' as EventId,
        date: tomorrowIsoDate(),
        pendingProposals: [],
      }),
    );
  });

  afterEach(() => {
    scheduler.stop();
  });

  it('evaluates confirmed events inside the proactive window', async () => {
    const runs = await scheduler.tick();

    expect(runs).toHaveLength(1);
    expect(runs[0]?.signalsCount).toBeGreaterThan(0);
    expect(scheduler.getStatus().lastRunAt).not.toBeNull();
  });

  it('starts and stops the background interval', () => {
    scheduler.start();
    expect(scheduler.getStatus().running).toBe(true);

    scheduler.stop();
    expect(scheduler.getStatus().running).toBe(false);
  });
});
