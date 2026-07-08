import type { WorkflowProposalId } from './ids.js';
import type { ContingencyPlan, TimelineBlock } from './timeline.js';
import type { RiskCategory } from './risk.js';

export type WorkflowProposalStatus = 'pending' | 'approved' | 'rejected';

export interface WorkflowAction {
  readonly type: 'notify_vendor' | 'shift_timeline' | 'activate_plan_b' | 'alert_staff';
  readonly target: string;
  readonly detail: string;
}

export interface WorkflowProposal {
  readonly id: WorkflowProposalId;
  readonly trigger: RiskCategory;
  readonly reason: string;
  readonly planB: ContingencyPlan;
  readonly actions: readonly WorkflowAction[];
  readonly status: WorkflowProposalStatus;
  readonly createdAt: string;
}

export interface OrchestrationState {
  readonly activePlan: ContingencyPlan['variant'];
  readonly timeline: readonly TimelineBlock[];
  readonly contingencyPlans: readonly ContingencyPlan[];
  readonly pendingProposals: readonly WorkflowProposal[];
}
