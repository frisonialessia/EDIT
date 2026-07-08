import type { ContingencyPlan, TimelineBlock } from '@edit-os/core';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { cn } from '@/lib/utils';

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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <SectionLabel>Active timeline</SectionLabel>
        <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{planLabel}</span>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {sorted.map((block) => (
          <div key={block.id as string} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4">
            <span className="font-mono text-[11px] text-neutral-500">
              {block.startsAt}–{block.endsAt}
            </span>
            <div>
              <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{block.label}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                {block.vendorCategory ?? 'general'} · Plan {block.planVariant}
              </p>
            </div>
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.12em]',
                block.status === 'delayed' ? 'text-neutral-700' : 'text-neutral-400',
              )}
            >
              {block.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
