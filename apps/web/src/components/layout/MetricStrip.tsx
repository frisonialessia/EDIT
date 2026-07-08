import { SectionLabel } from '@/components/layout/SectionLabel';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string;
}

interface MetricStripProps {
  metrics: Metric[];
}

export function MetricStrip({ metrics }: MetricStripProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid border-y border-neutral-200 dark:border-neutral-800',
        metrics.length === 4 && 'grid-cols-2 lg:grid-cols-4',
        metrics.length === 3 && 'grid-cols-3',
      )}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={cn(
            'py-8 pr-8',
            index > 0 && 'border-t border-neutral-200 pl-8 lg:border-l lg:border-t-0 dark:border-neutral-800',
          )}
        >
          <SectionLabel>{metric.label}</SectionLabel>
          <p className="mt-3 text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}
