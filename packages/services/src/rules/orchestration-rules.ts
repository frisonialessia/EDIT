import type {
  ContingencyPlan,
  Event,
  PolicyThresholds,
  RiskSignal,
  TimelineBlock,
  WorkflowAction,
  WorkflowProposal,
  WorkflowProposalId,
} from '@edit-os/core';
import { cascadeShift, collectTransitiveDependents, findBlocksByTarget } from '../timeline-engine.js';
import { toRiskLevel } from './risk-level.js';

function asProposalId(id: string): WorkflowProposalId {
  return id as WorkflowProposalId;
}

function shiftTime(isoTime: string, minutes: number): string {
  const [hours, mins] = isoTime.split(':').map(Number);
  const total = (hours ?? 0) * 60 + (mins ?? 0) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildWeatherPlanB(event: Event): ContingencyPlan {
  const planABlocks = event.contingencyPlans.find((p) => p.variant === 'A')?.blocks ?? event.timeline;

  const adjustedBlocks: TimelineBlock[] = planABlocks.map((block) => {
    if (block.vendorCategory === 'catering' && block.label.toLowerCase().includes('montaje')) {
      return {
        ...block,
        startsAt: shiftTime(block.startsAt, -45),
        endsAt: shiftTime(block.endsAt, -45),
        status: 'adjusted',
        planVariant: 'B',
      };
    }

    if (block.label.toLowerCase().includes('cóctel') || block.label.toLowerCase().includes('cocktail')) {
      return {
        ...block,
        label: 'Cóctel — Salón interior',
        status: 'adjusted',
        planVariant: 'B',
      };
    }

    return { ...block, planVariant: 'B' as const, status: block.status === 'completed' ? 'completed' : 'adjusted' };
  });

  return {
    variant: 'B',
    label: 'Plan B — Interior + carpas de respaldo',
    blocks: adjustedBlocks,
  };
}

function buildTrafficAdjustedTimeline(event: Event): readonly TimelineBlock[] {
  const anchorIds = findBlocksByTarget(event.timeline, 'cóctel');
  const ids = anchorIds.length > 0 ? anchorIds : findBlocksByTarget(event.timeline, 'cocktail');

  const shiftedIds = collectTransitiveDependents(event.timeline, ids);

  return cascadeShift(event.timeline, ids, 30).map((block) =>
    shiftedIds.has(block.id)
      ? { ...block, planVariant: 'B' as const, status: 'delayed' as const }
      : { ...block, planVariant: 'B' as const },
  );
}

export function signalsFromReadings(
  readings: readonly { category: RiskSignal['category']; value: number; unit: string; message: string }[],
  detectedAt: string,
): RiskSignal[] {
  return readings.map((reading) => ({
    ...reading,
    level: toRiskLevel(reading.category, reading.value),
    detectedAt,
  }));
}

function hasPendingTrigger(event: Event, trigger: RiskSignal['category']): boolean {
  return event.pendingProposals.some((p) => p.trigger === trigger && p.status === 'pending');
}

export function evaluateWeatherRule(
  event: Event,
  signal: RiskSignal,
  now: string,
  thresholds: PolicyThresholds,
): WorkflowProposal | null {
  if (
    !event.isOutdoor ||
    signal.category !== 'weather' ||
    signal.value <= thresholds.weather.rainProbability
  ) {
    return null;
  }

  if (hasPendingTrigger(event, 'weather')) {
    return null;
  }

  const planB = buildWeatherPlanB(event);

  return {
    id: asProposalId(`proposal-weather-${Date.now()}`),
    trigger: 'weather',
    reason: `Lluvia prevista al ${signal.value}% — activar Plan B para proteger la experiencia al aire libre.`,
    planB,
    actions: [
      {
        type: 'notify_vendor',
        target: 'catering',
        detail: 'Activar Plan B: carpas de respaldo o traslado a salón interior.',
      },
      {
        type: 'shift_timeline',
        target: 'montaje',
        detail: 'Adelantar montaje 45 min para compensar cambio de venue.',
      },
      {
        type: 'activate_plan_b',
        target: event.id as string,
        detail: planB.label,
      },
    ],
    status: 'pending',
    createdAt: now,
  };
}

export function evaluateTrafficRule(
  event: Event,
  signal: RiskSignal,
  now: string,
  thresholds: PolicyThresholds,
): WorkflowProposal | null {
  if (signal.category !== 'traffic' || signal.value <= thresholds.traffic.delayMinutes) {
    return null;
  }

  if (hasPendingTrigger(event, 'traffic')) {
    return null;
  }

  const adjustedTimeline = buildTrafficAdjustedTimeline(event);
  const planB: ContingencyPlan = {
    variant: 'B',
    label: 'Plan B — Retraso por tráfico Lago di Como',
    blocks: adjustedTimeline,
  };

  const actions: WorkflowAction[] = [
    {
      type: 'shift_timeline',
      target: 'cóctel',
      detail: `Retrasar inicio del cóctel +30 min (retraso transporte: ${signal.value} min).`,
    },
    {
      type: 'notify_vendor',
      target: 'catering',
      detail: 'Avisar cocina para desplazar servicio.',
    },
    {
      type: 'notify_vendor',
      target: 'entertainment',
      detail: 'Avisar DJ para ajustar set programado.',
    },
  ];

  return {
    id: asProposalId(`proposal-traffic-${Date.now()}`),
    trigger: 'traffic',
    reason: `Retraso de ${signal.value} min en rutas de invitados — recalcular cadena de servicios.`,
    planB,
    actions,
    status: 'pending',
    createdAt: now,
  };
}

function buildAlertProposal(
  event: Event,
  trigger: RiskSignal['category'],
  reason: string,
  actions: WorkflowAction[],
  now: string,
): WorkflowProposal | null {
  if (hasPendingTrigger(event, trigger)) {
    return null;
  }

  const planB = event.contingencyPlans.find((p) => p.variant === 'B') ?? event.contingencyPlans[0];
  if (!planB) {
    return null;
  }

  return {
    id: asProposalId(`proposal-${trigger}-${Date.now()}`),
    trigger,
    reason,
    planB,
    actions,
    status: 'pending',
    createdAt: now,
  };
}

export function evaluateStaffRule(
  event: Event,
  signal: RiskSignal,
  now: string,
  thresholds: PolicyThresholds,
): WorkflowProposal | null {
  if (signal.category !== 'staff' || signal.value <= thresholds.staff.delayMinutes) {
    return null;
  }

  return buildAlertProposal(
    event,
    'staff',
    `Chef clave retrasado ${signal.value} min — proponer reasignación o activar suplente.`,
    [
      { type: 'alert_staff', target: 'kitchen', detail: 'Activar suplente de reserva.' },
      { type: 'notify_vendor', target: 'catering', detail: 'Reasignar tareas de servicio.' },
    ],
    now,
  );
}

export function evaluateGuestFlowRule(
  event: Event,
  signal: RiskSignal,
  now: string,
  thresholds: PolicyThresholds,
): WorkflowProposal | null {
  if (signal.category !== 'guest_flow' || signal.value <= thresholds.guest_flow.capacityPercent) {
    return null;
  }

  return buildAlertProposal(
    event,
    'guest_flow',
    `Zona de cóctel al ${signal.value}% — abrir área de descanso y acelerar transición.`,
    [
      { type: 'alert_staff', target: 'floor', detail: 'Abrir terraza secundaria.' },
      { type: 'shift_timeline', target: 'cena', detail: 'Adelantar transición al comedor +15 min.' },
    ],
    now,
  );
}

export function evaluateConsumptionRule(
  event: Event,
  signal: RiskSignal,
  now: string,
  thresholds: PolicyThresholds,
): WorkflowProposal | null {
  if (signal.category !== 'consumption' || signal.value <= thresholds.consumption.deviationPercent) {
    return null;
  }

  return buildAlertProposal(
    event,
    'consumption',
    `Consumo premium +${signal.value}% — gestionar reserva de stock con precaución.`,
    [
      { type: 'alert_staff', target: 'bar', detail: 'Limitar pours de Nativo Vermouth.' },
      { type: 'notify_vendor', target: 'bar', detail: 'Solicitar reserva de emergencia.' },
    ],
    now,
  );
}

export function evaluateAmbientRule(
  event: Event,
  signal: RiskSignal,
  now: string,
  thresholds: PolicyThresholds,
): WorkflowProposal | null {
  if (signal.category !== 'ambient' || signal.value <= thresholds.ambient.decibels) {
    return null;
  }

  return buildAlertProposal(
    event,
    'ambient',
    `Nivel acústico ${signal.value} dB — ajustar perfil de iluminación y alertar técnico.`,
    [
      { type: 'alert_staff', target: 'tech', detail: 'Reducir volumen en zona residencial.' },
      { type: 'activate_plan_b', target: event.id as string, detail: 'Perfil nocturno automático.' },
    ],
    now,
  );
}

export function evaluateCompoundRule(
  event: Event,
  signals: readonly RiskSignal[],
  thresholds: PolicyThresholds,
  now: string,
): WorkflowProposal | null {
  if (!event.isOutdoor || hasPendingTrigger(event, 'compound')) {
    return null;
  }

  const weather = signals.find((s) => s.category === 'weather');
  const traffic = signals.find((s) => s.category === 'traffic');

  if (!weather || !traffic) {
    return null;
  }

  if (
    weather.value <= thresholds.weather.rainProbability ||
    traffic.value <= thresholds.traffic.delayMinutes
  ) {
    return null;
  }

  const weatherPlanB = buildWeatherPlanB(event);
  const trafficTimeline = buildTrafficAdjustedTimeline({
    ...event,
    timeline: weatherPlanB.blocks,
  });

  const planB: ContingencyPlan = {
    variant: 'B',
    label: 'Plan B — Crisis Tier 2 (clima + tráfico)',
    blocks: trafficTimeline,
  };

  const actions: WorkflowAction[] = [
    {
      type: 'notify_vendor',
      target: 'catering',
      detail: 'Crisis Tier 2: activar interior + desplazar servicio por tráfico.',
    },
    {
      type: 'shift_timeline',
      target: 'montaje',
      detail: 'Adelantar montaje 45 min y retrasar cóctel +30 min.',
    },
    {
      type: 'notify_vendor',
      target: 'entertainment',
      detail: 'Avisar DJ para ajustar set tras retraso de invitados.',
    },
    {
      type: 'activate_plan_b',
      target: event.id as string,
      detail: planB.label,
    },
  ];

  return {
    id: asProposalId(`proposal-compound-${Date.now()}`),
    trigger: 'compound',
    reason: `Crisis Tier 2: lluvia al ${weather.value}% y retraso de ${traffic.value} min — activación coordinada Plan B.`,
    planB,
    actions,
    status: 'pending',
    createdAt: now,
  };
}
