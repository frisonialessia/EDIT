import type { ActionExecutionRecord } from '@edit-os/core';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { cn } from '@/lib/utils';

interface ActionHistoryPanelProps {
  records: readonly ActionExecutionRecord[];
}

const statusTone: Record<ActionExecutionRecord['status'], string> = {
  completed: 'text-neutral-700 dark:text-neutral-300',
  skipped: 'text-neutral-400',
  failed: 'text-neutral-900 dark:text-neutral-100',
};

export function ActionHistoryPanel({ records }: ActionHistoryPanelProps): React.JSX.Element {
  const sorted = [...records].sort((a, b) => b.executedAt.localeCompare(a.executedAt));

  if (sorted.length === 0) {
    return (
      <p className="text-[13px] text-neutral-500">
        No orchestration actions executed yet. Approve a proposal to trigger the domino chain.
      </p>
    );
  }

  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {sorted.map((record, index) => (
        <div
          key={`${record.executedAt}-${index}`}
          className="grid grid-cols-[88px_1fr_auto] items-start gap-4 py-4 first:pt-0"
        >
          <time className="font-mono text-[10px] text-neutral-400">
            {new Date(record.executedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
          <div>
            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              {record.action.type.replaceAll('_', ' ')} · {record.action.target}
            </p>
            <p className="mt-1 text-[12px] text-neutral-500">{record.action.detail}</p>
            <p className="mt-2 text-[11px] text-neutral-400">{record.outcome}</p>
          </div>
          <span
            className={cn(
              'text-[10px] uppercase tracking-[0.12em]',
              statusTone[record.status],
            )}
          >
            {record.status}
          </span>
        </div>
      ))}
    </div>
  );
}
