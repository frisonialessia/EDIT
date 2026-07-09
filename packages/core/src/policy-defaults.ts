import type { AutoApproveRule, PolicyThresholds } from './types/policy.js';

/** Matches prior hardcoded values in orchestration-rules.ts */
export const DEFAULT_THRESHOLDS: PolicyThresholds = {
  weather: { rainProbability: 60 },
  traffic: { delayMinutes: 20 },
  staff: { delayMinutes: 15 },
  guest_flow: { capacityPercent: 75 },
  consumption: { deviationPercent: 30 },
  ambient: { decibels: 70 },
};

export const DEFAULT_AUTO_APPROVE_RULES: readonly AutoApproveRule[] = [
  {
    id: 'auto-weather-extreme',
    label: 'Lluvia extrema en evento exterior',
    trigger: 'weather',
    enabled: true,
    minValue: 80,
    requiresOutdoor: true,
    actor: 'policy-engine',
  },
  {
    id: 'auto-compound-crisis',
    label: 'Crisis compuesta clima + tráfico',
    trigger: 'compound',
    enabled: true,
    minValue: 0,
    actor: 'policy-engine',
  },
];
