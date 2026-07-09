import type { EventId, SchedulerRunRecord, SchedulerStatus } from '@edit-os/core';
import type { DominoOrchestrator } from './domino-orchestrator.js';
import type { IEventRepository } from './repository.js';

const DEFAULT_INTERVAL_MS = 60_000;
const EVALUATION_WINDOW_DAYS = 7;

export interface EvaluationSchedulerDeps {
  readonly events: IEventRepository;
  readonly domino: DominoOrchestrator;
  readonly intervalMs?: number;
}

export class EvaluationScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastRunAt: string | null = null;
  private lastRuns: SchedulerRunRecord[] = [];
  private readonly intervalMs: number;

  constructor(private readonly deps: EvaluationSchedulerDeps) {
    this.intervalMs = deps.intervalMs ?? DEFAULT_INTERVAL_MS;
  }

  start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.tick();
    }, this.intervalMs);
  }

  stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
  }

  getStatus(): SchedulerStatus {
    return {
      running: this.timer !== null,
      intervalMs: this.intervalMs,
      lastRunAt: this.lastRunAt,
      lastRuns: [...this.lastRuns],
    };
  }

  async tick(): Promise<SchedulerRunRecord[]> {
    const runs: SchedulerRunRecord[] = [];
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + EVALUATION_WINDOW_DAYS);

    for (const event of await this.deps.events.listAll()) {
      if (!this.isEligible(event, now, windowEnd)) {
        continue;
      }

      const beforeCount = event.pendingProposals.length;
      const updated = await this.deps.domino.evaluateEvent(event.id);

      runs.push({
        eventId: event.id,
        ranAt: new Date().toISOString(),
        proposalsAdded: updated.pendingProposals.length - beforeCount,
        signalsCount: updated.riskProfile.signals.length,
      });
    }

    this.lastRunAt = new Date().toISOString();
    this.lastRuns = [...runs, ...this.lastRuns].slice(0, 20);
    return runs;
  }

  private isEligible(event: Awaited<ReturnType<IEventRepository['listAll']>>[number], now: Date, windowEnd: Date): boolean {
    if (event.status !== 'confirmed') {
      return false;
    }

    const eventDate = new Date(`${event.date}T00:00:00.000Z`);
    return eventDate >= now && eventDate <= windowEnd;
  }
}
