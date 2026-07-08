import type { ContingencyPlan, WorkflowProposal } from '@edit-os/core';
import { Loader2, Zap } from 'lucide-react';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Button } from '@/components/ui/button';

interface WorkflowProposalPanelProps {
  proposals: readonly WorkflowProposal[];
  contingencyPlans: readonly ContingencyPlan[];
  activePlan: ContingencyPlan['variant'];
  isProcessing: boolean;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
}

function PlanColumn({
  plan,
  label,
}: {
  plan: ContingencyPlan;
  label: string;
}): React.JSX.Element {
  return (
    <div className="border border-neutral-200 p-5 dark:border-neutral-800">
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-3 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{plan.label}</p>
      <ul className="mt-4 space-y-2">
        {plan.blocks.slice(0, 4).map((block) => (
          <li key={block.id as string} className="grid grid-cols-[1fr_auto] gap-3 text-[12px] text-neutral-600 dark:text-neutral-400">
            <span className="truncate">{block.label}</span>
            <span className="font-mono text-[10px]">{block.startsAt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkflowProposalPanel({
  proposals,
  contingencyPlans,
  activePlan,
  isProcessing,
  onApprove,
  onReject,
}: WorkflowProposalPanelProps): React.JSX.Element {
  if (proposals.length === 0) {
    return (
      <div className="border border-dashed border-neutral-200 px-8 py-12 text-center dark:border-neutral-800">
        <SectionLabel>Status</SectionLabel>
        <p className="mt-4 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">No pending adjustments</p>
        <p className="mt-2 text-[12px] text-neutral-500">
          Sensor proposals will appear here for one-click approval.
        </p>
      </div>
    );
  }

  const planA = contingencyPlans.find((p) => p.variant === 'A');
  const planB = contingencyPlans.find((p) => p.variant === 'B');

  return (
    <div className="space-y-6">
      {proposals.map((proposal) => (
        <article key={proposal.id as string} className="border border-neutral-200 dark:border-neutral-800">
          <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-4 w-4 text-neutral-500" />
              <div>
                <SectionLabel>Domino · {proposal.trigger}</SectionLabel>
                <p className="mt-2 text-[14px] font-medium leading-snug text-neutral-900 dark:text-neutral-100">
                  {proposal.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800">
            {planA ? <PlanColumn plan={planA} label={`Plan A · ${activePlan === 'A' ? 'active' : 'current'}`} /> : null}
            <PlanColumn plan={proposal.planB ?? planB!} label="Plan B · proposed" />
          </div>

          <div className="border-t border-neutral-200 px-6 py-5 dark:border-neutral-800">
            <SectionLabel>Automatic actions</SectionLabel>
            <ul className="mt-4 space-y-2">
              {proposal.actions.map((action, index) => (
                <li key={`${action.type}-${index}`} className="grid grid-cols-[100px_1fr] gap-3 text-[12px] text-neutral-600 dark:text-neutral-400">
                  <span className="uppercase tracking-[0.08em] text-neutral-500">{action.target}</span>
                  <span>{action.detail}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button disabled={isProcessing} onClick={() => onApprove(proposal.id as string)}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Applying
                  </>
                ) : (
                  'Approve Plan B'
                )}
              </Button>
              <Button variant="ghost" disabled={isProcessing} onClick={() => onReject(proposal.id as string)}>
                Maintain Plan A
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
