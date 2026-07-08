import type { RiskCategory, RiskLevel, RiskSignal } from '@edit-os/core';
import {
  Car,
  CloudRain,
  Gauge,
  UserCheck,
  Users,
  Wine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryLabels: Record<RiskCategory, string> = {
  weather: 'Clima',
  traffic: 'Tráfico',
  staff: 'Personal',
  guest_flow: 'Flujo invitados',
  consumption: 'Consumo',
  ambient: 'Ambiente',
};

const categoryIcons: Record<RiskCategory, typeof CloudRain> = {
  weather: CloudRain,
  traffic: Car,
  staff: UserCheck,
  guest_flow: Users,
  consumption: Wine,
  ambient: Gauge,
};

const levelStyles: Record<RiskLevel, string> = {
  low: 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400',
  medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
  high: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300',
  critical: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
};

const levelBar: Record<RiskLevel, string> = {
  low: 'bg-neutral-300 dark:bg-neutral-600',
  medium: 'bg-amber-400',
  high: 'bg-orange-500',
  critical: 'bg-rose-500',
};

interface RiskMonitorProps {
  signals: readonly RiskSignal[];
}

function RiskCard({ signal }: { signal: RiskSignal }): React.JSX.Element {
  const Icon = categoryIcons[signal.category];

  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-5 dark:border-neutral-800/70 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900">
            <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              {categoryLabels[signal.category]}
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-neutral-500">
              {signal.value}
              {signal.unit}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            levelStyles[signal.level],
          )}
        >
          {signal.level}
        </span>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        {signal.message}
      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
        <div
          className={cn('h-full rounded-full transition-all', levelBar[signal.level])}
          style={{ width: `${Math.min(signal.value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function RiskMonitor({ signals }: RiskMonitorProps): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {signals.map((signal) => (
        <RiskCard key={signal.category} signal={signal} />
      ))}
    </div>
  );
}
