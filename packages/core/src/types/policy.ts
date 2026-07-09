import type { EventId, WorkflowProposalId } from './ids.js';
import type { RiskCategory } from './risk.js';
import type { WorkflowProposal } from './orchestration.js';

export interface PolicyThresholds {
  readonly weather: { readonly rainProbability: number };
  readonly traffic: { readonly delayMinutes: number };
  readonly staff: { readonly delayMinutes: number };
  readonly guest_flow: { readonly capacityPercent: number };
  readonly consumption: { readonly deviationPercent: number };
  readonly ambient: { readonly decibels: number };
}

export interface AutoApproveRule {
  readonly id: string;
  readonly label: string;
  readonly trigger: RiskCategory;
  readonly enabled: boolean;
  readonly minValue: number;
  readonly requiresOutdoor?: boolean;
  readonly actor: 'policy-engine' | 'system';
}

export interface OrchestrationPolicy {
  readonly orgId: string;
  readonly thresholds: PolicyThresholds;
  readonly autoApproveRules: readonly AutoApproveRule[];
  readonly compoundRulesEnabled: boolean;
}

export type OrchestrationDecision =
  | 'auto_approved'
  | 'proposed'
  | 'manual_approved'
  | 'rejected';

export interface OrchestrationLog {
  readonly id: string;
  readonly eventId: EventId;
  readonly trigger: RiskCategory | 'compound';
  readonly decision: OrchestrationDecision;
  readonly actor: string;
  readonly reason: string;
  readonly proposalId?: WorkflowProposalId;
  readonly timestamp: string;
}

export type PolicyProposalContext = {
  readonly proposal: WorkflowProposal;
  readonly isOutdoor: boolean;
  readonly signals: readonly { category: RiskCategory; value: number }[];
};
