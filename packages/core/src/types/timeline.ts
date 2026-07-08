import type { TimelineBlockId, VendorId } from './ids.js';
import type { VendorCategory } from './vendor.js';

export type TimelineBlockStatus = 'scheduled' | 'delayed' | 'adjusted' | 'completed';
export type PlanVariant = 'A' | 'B';

export interface TimelineBlock {
  readonly id: TimelineBlockId;
  readonly label: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly vendorCategory?: VendorCategory;
  readonly vendorId?: VendorId;
  readonly dependsOn?: readonly TimelineBlockId[];
  readonly slackMinutes?: number;
  readonly status: TimelineBlockStatus;
  readonly planVariant: PlanVariant;
}

export interface ContingencyPlan {
  readonly variant: PlanVariant;
  readonly label: string;
  readonly blocks: readonly TimelineBlock[];
}
