import type { Client } from './client.js';
import type { EventStatus } from './event-status.js';
import type { EventId } from './ids.js';
import type { ContingencyPlan, TimelineBlock } from './timeline.js';
import type { RiskProfile } from './risk.js';
import type { ActionExecutionRecord, WorkflowProposal } from './orchestration.js';
import type { Vendor } from './vendor.js';

export interface Event {
  readonly id: EventId;
  readonly name: string;
  /** Fecha del evento en formato ISO 8601 (YYYY-MM-DD). */
  readonly date: string;
  readonly status: EventStatus;
  readonly location: string;
  readonly isOutdoor: boolean;
  readonly client: Client;
  readonly vendors: readonly Vendor[];
  readonly timeline: readonly TimelineBlock[];
  readonly contingencyPlans: readonly ContingencyPlan[];
  readonly riskProfile: RiskProfile;
  readonly pendingProposals: readonly WorkflowProposal[];
  readonly activePlan: 'A' | 'B';
  readonly actionHistory: readonly ActionExecutionRecord[];
}
