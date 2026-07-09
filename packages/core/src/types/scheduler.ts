import type { EventId } from './ids.js';

export interface SchedulerRunRecord {
  readonly eventId: EventId;
  readonly ranAt: string;
  readonly proposalsAdded: number;
  readonly signalsCount: number;
}

export interface SchedulerStatus {
  readonly running: boolean;
  readonly intervalMs: number;
  readonly lastRunAt: string | null;
  readonly lastRuns: readonly SchedulerRunRecord[];
}
