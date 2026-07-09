import type {
  ClientId,
  Event,
  EventId,
  Message,
  MessageId,
  MessageThread,
  ProfileState,
  TimelineBlockId,
  VendorId,
  WorkflowProposalId,
} from '@edit-os/core';

export const DEMO_EVENT_ID = 'event-1' as EventId;

export function createDemoEvent(): Event {
  return {
    id: DEMO_EVENT_ID,
    name: 'Como Villa Gala',
    date: '2026-09-15',
    status: 'confirmed',
    location: 'Villa del Balbianello, Lago di Como',
    isOutdoor: true,
    client: {
      id: 'client-1' as ClientId,
      name: 'Alessia Rossi',
      email: 'alessia@example.com',
    },
    vendors: [
      {
        id: 'vendor-1' as VendorId,
        name: 'Lake Como Luxury Catering',
        category: 'catering',
        email: 'bookings@luxcatering.example',
        regions: ['EU', 'US'],
      },
    ],
    timeline: [
      {
        id: 'block-setup' as TimelineBlockId,
        label: 'Montaje catering',
        startsAt: '16:00',
        endsAt: '17:30',
        vendorCategory: 'catering',
        vendorId: 'vendor-1' as VendorId,
        slackMinutes: 15,
        status: 'scheduled',
        planVariant: 'A',
      },
      {
        id: 'block-cocktail' as TimelineBlockId,
        label: 'Cóctel — Terraza lago',
        startsAt: '18:00',
        endsAt: '19:30',
        vendorCategory: 'catering',
        vendorId: 'vendor-1' as VendorId,
        dependsOn: ['block-setup' as TimelineBlockId],
        slackMinutes: 10,
        status: 'scheduled',
        planVariant: 'A',
      },
      {
        id: 'block-dj' as TimelineBlockId,
        label: 'DJ — Ambient set',
        startsAt: '19:00',
        endsAt: '23:00',
        vendorCategory: 'entertainment',
        dependsOn: ['block-cocktail' as TimelineBlockId],
        status: 'scheduled',
        planVariant: 'A',
      },
      {
        id: 'block-dinner' as TimelineBlockId,
        label: 'Cena de autor',
        startsAt: '20:00',
        endsAt: '22:30',
        vendorCategory: 'catering',
        vendorId: 'vendor-1' as VendorId,
        dependsOn: ['block-cocktail' as TimelineBlockId],
        status: 'scheduled',
        planVariant: 'A',
      },
    ],
    contingencyPlans: [
      {
        variant: 'A',
        label: 'Plan A — Terraza al lago',
        blocks: [
          {
            id: 'block-cocktail' as TimelineBlockId,
            label: 'Cóctel — Terraza lago',
            startsAt: '18:00',
            endsAt: '19:30',
            vendorCategory: 'catering',
            status: 'scheduled',
            planVariant: 'A',
          },
        ],
      },
      {
        variant: 'B',
        label: 'Plan B — Interior + carpas de respaldo',
        blocks: [
          {
            id: 'block-cocktail-b' as TimelineBlockId,
            label: 'Cóctel — Salón interior',
            startsAt: '18:00',
            endsAt: '19:30',
            vendorCategory: 'catering',
            status: 'adjusted',
            planVariant: 'B',
          },
        ],
      },
    ],
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
    pendingProposals: [
      {
        id: 'proposal-weather-1' as WorkflowProposalId,
        trigger: 'weather',
        reason:
          'Lluvia prevista al 72% — el sistema propone activar Plan B antes de que el invitado lo note.',
        planB: {
          variant: 'B',
          label: 'Plan B — Interior + carpas de respaldo',
          blocks: [
            {
              id: 'block-cocktail-b' as TimelineBlockId,
              label: 'Cóctel — Salón interior',
              startsAt: '18:00',
              endsAt: '19:30',
              vendorCategory: 'catering',
              status: 'adjusted',
              planVariant: 'B',
            },
          ],
        },
        actions: [
          {
            type: 'notify_vendor',
            target: 'catering',
            detail: 'Activar Plan B: carpas o traslado interior.',
          },
          {
            type: 'shift_timeline',
            target: 'montaje',
            detail: 'Adelantar montaje 45 min.',
          },
          {
            type: 'activate_plan_b',
            target: 'event-1',
            detail: 'Plan B — Interior + carpas de respaldo',
          },
        ],
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ],
    actionHistory: [],
    orchestrationLogs: [],
  };
}

export const demoProfile: ProfileState = {
  profile: {
    id: 'client-1' as ClientId,
    name: 'Alessia Rossi',
    email: 'alessia@example.com',
    title: 'Event Architect · Casa Convivium',
    role: 'architect',
    timezone: 'Europe/Rome',
  },
  team: [
    {
      id: 'team-1',
      name: 'Marco Bianchi',
      role: 'Executive Chef',
      email: 'marco@catering.example',
      status: 'available',
    },
    {
      id: 'team-2',
      name: 'Elena Conti',
      role: 'Floor Director',
      email: 'elena@convivium.example',
      status: 'available',
    },
    {
      id: 'team-3',
      name: 'Luca Ferretti',
      role: 'DJ / Entertainment',
      email: 'luca@sound.example',
      status: 'delayed',
    },
  ],
  notifications: {
    weather: true,
    traffic: true,
    staff: true,
    guestFlow: true,
    consumption: true,
    ambient: true,
    emailDigest: false,
  },
  integrations: {
    openWeatherConfigured: false,
    googleMapsConfigured: false,
  },
  billing: {
    plan: 'estate',
    eventsRemaining: 12,
    renewsAt: '2026-12-01',
  },
};

export const demoThreads: MessageThread[] = [
  {
    id: 'thread-catering',
    eventId: DEMO_EVENT_ID,
    title: 'Lake Como Luxury Catering',
    lastMessage: 'We can deploy tents in 40 minutes or move cocktail indoors.',
    lastMessageAt: new Date(Date.now() - 3000000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'thread-dj',
    eventId: DEMO_EVENT_ID,
    title: 'Luca Ferretti · DJ',
    lastMessage: 'Running 20 min late due to traffic on SP583.',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'thread-staff',
    eventId: DEMO_EVENT_ID,
    title: 'Staff coordination',
    lastMessage: 'Staff coordination channel ready.',
    lastMessageAt: new Date(Date.now() - 900000).toISOString(),
    unreadCount: 0,
  },
];

export const demoMessages: Record<string, Message[]> = {
  'thread-catering': [
    {
      id: 'msg-1' as MessageId,
      eventId: DEMO_EVENT_ID,
      threadId: 'thread-catering',
      senderId: 'system',
      senderName: 'EDIT-OS',
      body: 'Weather alert: 72% rain in 3h. Plan B proposal ready for approval.',
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      isSystem: true,
    },
    {
      id: 'msg-2' as MessageId,
      eventId: DEMO_EVENT_ID,
      threadId: 'thread-catering',
      senderId: 'vendor-1',
      senderName: 'Lake Como Luxury Catering',
      body: 'Received. We can deploy tents in 40 minutes or move cocktail indoors.',
      sentAt: new Date(Date.now() - 3000000).toISOString(),
      isSystem: false,
    },
  ],
  'thread-dj': [
    {
      id: 'msg-3' as MessageId,
      eventId: DEMO_EVENT_ID,
      threadId: 'thread-dj',
      senderId: 'team-3',
      senderName: 'Luca Ferretti',
      body: 'Running 20 min late due to traffic on SP583. Adjust set start?',
      sentAt: new Date(Date.now() - 1800000).toISOString(),
      isSystem: false,
    },
  ],
  'thread-staff': [
    {
      id: 'msg-4' as MessageId,
      eventId: DEMO_EVENT_ID,
      threadId: 'thread-staff',
      senderId: 'system',
      senderName: 'EDIT-OS',
      body: 'Staff coordination channel ready.',
      sentAt: new Date(Date.now() - 900000).toISOString(),
      isSystem: true,
    },
  ],
};
