import type {
  ContingencyPlan,
  Event,
  RiskSignal,
  TimelineBlock,
  WorkflowAction,
  WorkflowProposal,
  WorkflowProposalId,
} from '@edit-os/core';
import { toRiskLevel } from './risk-level.js';

const WEATHER_RAIN_THRESHOLD = 60;
const TRAFFIC_DELAY_THRESHOLD = 20;

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
  return event.timeline.map((block) => {
    const shouldShift =
      block.vendorCategory === 'catering' ||
      block.vendorCategory === 'entertainment' ||
      block.label.toLowerCase().includes('cóctel') ||
      block.label.toLowerCase().includes('cocktail');

    if (!shouldShift) {
      return block;
    }

    return {
      ...block,
      startsAt: shiftTime(block.startsAt, 30),
      endsAt: shiftTime(block.endsAt, 30),
      status: 'delayed' as const,
    };
  });
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

export function evaluateWeatherRule(
  event: Event,
  signal: RiskSignal,
  now: string,
): WorkflowProposal | null {
  if (!event.isOutdoor || signal.category !== 'weather' || signal.value <= WEATHER_RAIN_THRESHOLD) {
    return null;
  }

  const existing = event.pendingProposals.find(
    (p) => p.trigger === 'weather' && p.status === 'pending',
  );
  if (existing) {
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
): { proposal: WorkflowProposal; timeline: readonly TimelineBlock[] } | null {
  if (signal.category !== 'traffic' || signal.value <= TRAFFIC_DELAY_THRESHOLD) {
    return null;
  }

  const existing = event.pendingProposals.find(
    (p) => p.trigger === 'traffic' && p.status === 'pending',
  );
  if (existing) {
    return null;
  }

  const adjustedTimeline = buildTrafficAdjustedTimeline(event);
  const planB: ContingencyPlan = {
    variant: 'B',
    label: 'Plan B — Retraso por tráfico Lago di Como',
    blocks: adjustedTimeline.map((b) => ({ ...b, planVariant: 'B' as const })),
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
    timeline: adjustedTimeline,
    proposal: {
      id: asProposalId(`proposal-traffic-${Date.now()}`),
      trigger: 'traffic',
      reason: `Retraso de ${signal.value} min en rutas de invitados — recalcular cadena de servicios.`,
      planB,
      actions,
      status: 'pending',
      createdAt: now,
    },
  };
}
