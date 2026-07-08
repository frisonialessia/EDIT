import type {
  Client,
  ClientId,
  ContingencyPlan,
  Event,
  EventId,
  TimelineBlock,
  TimelineBlockId,
  Vendor,
  VendorId,
  WorkflowProposal,
  WorkflowProposalId,
} from '@edit-os/core';

export const comoVillaGalaIds = {
  eventId: 'event-1' as EventId,
  vendorId: 'vendor-1' as VendorId,
  clientId: 'client-1' as ClientId,
} as const;

function blockId(id: string): TimelineBlockId {
  return id as TimelineBlockId;
}

function proposalId(id: string): WorkflowProposalId {
  return id as WorkflowProposalId;
}

export const planABlocks: TimelineBlock[] = [
  {
    id: blockId('block-setup'),
    label: 'Montaje catering',
    startsAt: '16:00',
    endsAt: '17:30',
    vendorCategory: 'catering',
    vendorId: comoVillaGalaIds.vendorId,
    slackMinutes: 15,
    status: 'scheduled',
    planVariant: 'A',
  },
  {
    id: blockId('block-cocktail'),
    label: 'Cóctel — Terraza lago',
    startsAt: '18:00',
    endsAt: '19:30',
    vendorCategory: 'catering',
    vendorId: comoVillaGalaIds.vendorId,
    dependsOn: [blockId('block-setup')],
    slackMinutes: 10,
    status: 'scheduled',
    planVariant: 'A',
  },
  {
    id: blockId('block-dj'),
    label: 'DJ — Ambient set',
    startsAt: '19:00',
    endsAt: '23:00',
    vendorCategory: 'entertainment',
    dependsOn: [blockId('block-cocktail')],
    status: 'scheduled',
    planVariant: 'A',
  },
  {
    id: blockId('block-dinner'),
    label: 'Cena de autor',
    startsAt: '20:00',
    endsAt: '22:30',
    vendorCategory: 'catering',
    vendorId: comoVillaGalaIds.vendorId,
    dependsOn: [blockId('block-cocktail')],
    status: 'scheduled',
    planVariant: 'A',
  },
];

export const planBBlocks: TimelineBlock[] = [
  {
    id: blockId('block-setup-b'),
    label: 'Montaje catering — ampliado',
    startsAt: '15:15',
    endsAt: '17:30',
    vendorCategory: 'catering',
    vendorId: comoVillaGalaIds.vendorId,
    slackMinutes: 15,
    status: 'adjusted',
    planVariant: 'B',
  },
  {
    id: blockId('block-cocktail-b'),
    label: 'Cóctel — Salón interior',
    startsAt: '18:00',
    endsAt: '19:30',
    vendorCategory: 'catering',
    vendorId: comoVillaGalaIds.vendorId,
    dependsOn: [blockId('block-setup-b')],
    slackMinutes: 10,
    status: 'adjusted',
    planVariant: 'B',
  },
  {
    id: blockId('block-dj-b'),
    label: 'DJ — Ambient set',
    startsAt: '19:00',
    endsAt: '23:00',
    vendorCategory: 'entertainment',
    dependsOn: [blockId('block-cocktail-b')],
    status: 'scheduled',
    planVariant: 'B',
  },
  {
    id: blockId('block-dinner-b'),
    label: 'Cena de autor',
    startsAt: '20:00',
    endsAt: '22:30',
    vendorCategory: 'catering',
    vendorId: comoVillaGalaIds.vendorId,
    dependsOn: [blockId('block-cocktail-b')],
    status: 'scheduled',
    planVariant: 'B',
  },
];

export const contingencyPlans: ContingencyPlan[] = [
  { variant: 'A', label: 'Plan A — Terraza al lago', blocks: planABlocks },
  { variant: 'B', label: 'Plan B — Interior + carpas de respaldo', blocks: planBBlocks },
];

export const initialWeatherProposal: WorkflowProposal = {
  id: proposalId('proposal-weather-1'),
  trigger: 'weather',
  reason:
    'Lluvia prevista al 72% en las próximas 3 horas — el sistema propone activar Plan B antes de que el invitado lo note.',
  planB: contingencyPlans[1]!,
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
      target: 'event-1',
      detail: 'Plan B — Interior + carpas de respaldo',
    },
  ],
  status: 'pending',
  createdAt: new Date().toISOString(),
};

export function createComoVillaGalaClient(): Client {
  return {
    id: comoVillaGalaIds.clientId,
    name: 'Alessia Rossi',
    email: 'alessia@example.com',
  };
}

export function createComoVillaGalaVendor(): Vendor {
  return {
    id: comoVillaGalaIds.vendorId,
    name: 'Lake Como Luxury Catering',
    category: 'catering',
    email: 'bookings@luxcatering.example',
    regions: ['EU', 'US'],
  };
}

export function createComoVillaGalaEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: comoVillaGalaIds.eventId,
    name: 'Como Villa Gala',
    date: '2026-09-15',
    status: 'confirmed',
    location: 'Villa del Balbianello, Lago di Como',
    isOutdoor: true,
    client: createComoVillaGalaClient(),
    vendors: [],
    timeline: planABlocks,
    contingencyPlans,
    activePlan: 'A',
    riskProfile: {
      signals: [
        {
          category: 'weather',
          level: 'high',
          value: 72,
          unit: '%',
          message: '72% rain probability in the next 3 hours near Villa del Balbianello.',
          detectedAt: new Date().toISOString(),
        },
        {
          category: 'traffic',
          level: 'high',
          value: 25,
          unit: 'min',
          message: 'Guest transport delayed 25 min on routes to Lago di Como.',
          detectedAt: new Date().toISOString(),
        },
        {
          category: 'staff',
          level: 'low',
          value: 0,
          unit: 'min',
          message: 'All key staff on schedule.',
          detectedAt: new Date().toISOString(),
        },
        {
          category: 'guest_flow',
          level: 'low',
          value: 42,
          unit: '%',
          message: 'Cóctel zone at 42% capacity — flow nominal.',
          detectedAt: new Date().toISOString(),
        },
        {
          category: 'consumption',
          level: 'medium',
          value: 18,
          unit: '%',
          message: 'Nativo Vermouth consumption 18% above historical pace.',
          detectedAt: new Date().toISOString(),
        },
        {
          category: 'ambient',
          level: 'low',
          value: 48,
          unit: 'dB',
          message: 'Ambient sound within residential threshold.',
          detectedAt: new Date().toISOString(),
        },
      ],
    },
    pendingProposals: [initialWeatherProposal],
    actionHistory: [],
    ...overrides,
  };
}
