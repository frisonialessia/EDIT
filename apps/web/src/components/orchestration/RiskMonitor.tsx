import type { RiskCategory, RiskLevel, RiskSignal } from '@edit-os/core';
import { Car, CloudRain, Gauge, UserCheck, Users, Wine } from 'lucide-react';
import { SectionLabel } from '@/components/layout/SectionLabel';

const categoryLabels: Record<RiskCategory, string> = {
  weather: 'Clima',
  traffic: 'Tráfico',
  staff: 'Personal',
  guest_flow: 'Flujo invitados',
  consumption: 'Consumo',
  ambient: 'Ambiente',
  compound: 'Crisis compuesta',
};

const categoryIcons: Record<RiskCategory, typeof CloudRain> = {
  weather: CloudRain,
  traffic: Car,
  staff: UserCheck,
  guest_flow: Users,
  consumption: Wine,
  ambient: Gauge,
  compound: CloudRain,
};

const levelTone: Record<RiskLevel, string> = {
  low: 'text-neutral-500',
  medium: 'text-neutral-600',
  high: 'text-neutral-800 dark:text-neutral-200',
  critical: 'text-neutral-950 dark:text-neutral-50',
};

interface RiskMonitorProps {
  signals: readonly RiskSignal[];
}

function RiskRow({ signal }: { signal: RiskSignal }): React.JSX.Element {
  const Icon = categoryIcons[signal.category];

  return (
    <div className="grid grid-cols-[20px_1fr_auto] items-start gap-4 border-b border-neutral-200 py-5 last:border-b-0 dark:border-neutral-800">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-neutral-400" />
      <div>
        <SectionLabel>{categoryLabels[signal.category]}</SectionLabel>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{signal.message}</p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-medium tabular-nums text-neutral-950 dark:text-neutral-50">
          {signal.value}
          <span className="text-[11px] font-normal text-neutral-500">{signal.unit}</span>
        </p>
        <p className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${levelTone[signal.level]}`}>{signal.level}</p>
      </div>
    </div>
  );
}

export function RiskMonitor({ signals }: RiskMonitorProps): React.JSX.Element {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800">
      {signals.map((signal) => (
        <div key={signal.category} className="border-b border-neutral-200 px-5 last:border-b-0 dark:border-neutral-800">
          <RiskRow signal={signal} />
        </div>
      ))}
    </div>
  );
}
