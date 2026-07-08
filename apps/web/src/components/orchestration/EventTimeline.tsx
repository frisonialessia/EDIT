import type { ContingencyPlan, TimelineBlock } from '@edit-os/core';
import { cn } from '@/lib/utils';

const statusStyles: Record<TimelineBlock['status'], string> = {
  scheduled: 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
  delayed: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20',
  adjusted: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20',
  completed: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20',
};

const statusDot: Record<TimelineBlock['status'], string> = {
  scheduled: 'bg-neutral-400',
  delayed: 'bg-amber-500',
  adjusted: 'bg-blue-500',
  completed: 'bg-emerald-500',
};

interface EventTimelineProps {
  timeline: readonly TimelineBlock[];
  activePlan: ContingencyPlan['variant'];
  contingencyPlans: readonly ContingencyPlan[];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function EventTimeline({
  timeline,
  activePlan,
  contingencyPlans,
}: EventTimelineProps): React.JSX.Element {
  const planLabel = contingencyPlans.find((p) => p.variant === activePlan)?.label ?? `Plan ${activePlan}`;
  const sorted = [...timeline].sort((a, b) => timeToMinutes(a.startsAt) - timeToMinutes(b.startsAt));
  const startMinutes = sorted.length > 0 ? timeToMinutes(sorted[0]!.startsAt) : 0;
  const endMinutes = sorted.length > 0 ? timeToMinutes(sorted[sorted.length - 1]!.endsAt) : 0;
  const span = Math.max(endMinutes - startMinutes, 60);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-[12px] font-normal text-neutral-500">
          Timeline activa · se ajusta automáticamente con el efecto dominó
        </p>
        <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          {planLabel}
        </span>
      </div>

      <div className="relative space-y-0">
        <div className="absolute bottom-4 left-[7px] top-4 w-px bg-neutral-200 dark:bg-neutral-800" aria-hidden />

        {sorted.map((block) => {
          const offset = ((timeToMinutes(block.startsAt) - startMinutes) / span) * 100;

          return (
            <div key={block.id as string} className="relative flex gap-5 pb-8 last:pb-0">
              <div className="relative z-10 mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <span className={cn('h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-950', statusDot[block.status])} />
              </div>

              <div
                className={cn(
                  'min-w-0 flex-1 rounded-xl border px-5 py-4 transition-colors',
                  statusStyles[block.status],
                )}
                style={{ marginLeft: `${Math.min(offset, 12)}%` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                      {block.label}
                    </p>
                    <p className="mt-1 text-[12px] font-normal capitalize text-neutral-500">
                      {block.vendorCategory ?? 'general'} · Plan {block.planVariant}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[12px] font-semibold text-neutral-700 dark:text-neutral-300">
                      {block.startsAt} – {block.endsAt}
                    </p>
                    <p className="mt-1 text-[11px] font-medium capitalize text-neutral-400">{block.status}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
