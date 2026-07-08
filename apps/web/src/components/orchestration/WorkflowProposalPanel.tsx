import type { ContingencyPlan, WorkflowProposal } from '@edit-os/core';
import { ArrowRight, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkflowProposalPanelProps {
  proposals: readonly WorkflowProposal[];
  contingencyPlans: readonly ContingencyPlan[];
  activePlan: ContingencyPlan['variant'];
  isProcessing: boolean;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
}

function PlanPreview({
  plan,
  highlight,
}: {
  plan: ContingencyPlan;
  highlight: boolean;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        highlight
          ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/20'
          : 'border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950',
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
        Plan {plan.variant}
      </p>
      <p className="mt-2 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
        {plan.label}
      </p>
      <ul className="mt-4 space-y-2">
        {plan.blocks.slice(0, 4).map((block) => (
          <li
            key={block.id as string}
            className="flex items-center justify-between gap-3 text-[12px] text-neutral-600 dark:text-neutral-400"
          >
            <span className="truncate">{block.label}</span>
            <span className="shrink-0 font-mono text-[11px]">{block.startsAt}</span>
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
      <div className="rounded-xl border border-dashed border-neutral-200/70 bg-white px-8 py-10 text-center dark:border-neutral-800/70 dark:bg-neutral-950">
        <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
          Sin ajustes pendientes
        </p>
        <p className="mt-2 text-[12px] text-neutral-500">
          El sistema monitorea sensores en tiempo real. Las propuestas aparecerán aquí para aprobación con un clic.
        </p>
      </div>
    );
  }

  const planA = contingencyPlans.find((p) => p.variant === 'A');
  const planB = contingencyPlans.find((p) => p.variant === 'B');

  return (
    <div className="space-y-6">
      {proposals.map((proposal) => (
        <article
          key={proposal.id as string}
          className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950"
        >
          <div className="border-b border-neutral-200/70 px-6 py-5 dark:border-neutral-800/70">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                  Efecto dominó · {proposal.trigger}
                </p>
                <p className="mt-1 text-[14px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                  {proposal.reason}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {planA ? <PlanPreview plan={planA} highlight={activePlan === 'A'} /> : null}
            <ArrowRight className="mx-auto hidden h-5 w-5 text-neutral-300 lg:block dark:text-neutral-600" />
            <PlanPreview plan={proposal.planB ?? planB!} highlight={activePlan === 'B'} />
          </div>

          <div className="border-t border-neutral-200/70 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800/70 dark:bg-neutral-900/30">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
              Acciones automáticas
            </p>
            <ul className="mb-5 space-y-2">
              {proposal.actions.map((action, index) => (
                <li
                  key={`${action.type}-${index}`}
                  className="flex items-start gap-2 text-[12px] text-neutral-600 dark:text-neutral-400"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                  <span>
                    <span className="font-medium capitalize text-neutral-800 dark:text-neutral-200">
                      {action.target}
                    </span>
                    {' — '}
                    {action.detail}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={isProcessing}
                onClick={() => onApprove(proposal.id as string)}
                className="min-w-[140px] shadow-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Aplicando…
                  </>
                ) : (
                  'Aprobar Plan B'
                )}
              </Button>
              <Button
                variant="ghost"
                disabled={isProcessing}
                onClick={() => onReject(proposal.id as string)}
                className="shadow-none"
              >
                Mantener Plan A
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
