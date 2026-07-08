import type { ProfileState } from '@edit-os/core';
import { comoVillaGalaIds } from './fixtures/como-villa-gala.js';

export function createDefaultProfile(integrations: {
  openWeatherConfigured: boolean;
  googleMapsConfigured: boolean;
}): ProfileState {
  return {
    profile: {
      id: comoVillaGalaIds.clientId,
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
    integrations,
    billing: {
      plan: 'estate',
      eventsRemaining: 12,
      renewsAt: '2026-12-01',
    },
  };
}

export interface IProfileRepository {
  get(): Promise<ProfileState>;
  update(partial: Partial<ProfileState>): Promise<ProfileState>;
}

export class InMemoryProfileRepository implements IProfileRepository {
  private state: ProfileState;

  constructor(initial: ProfileState) {
    this.state = initial;
  }

  async get(): Promise<ProfileState> {
    return this.state;
  }

  async update(partial: Partial<ProfileState>): Promise<ProfileState> {
    this.state = {
      ...this.state,
      ...partial,
      profile: partial.profile ? { ...this.state.profile, ...partial.profile } : this.state.profile,
      notifications: partial.notifications
        ? { ...this.state.notifications, ...partial.notifications }
        : this.state.notifications,
      integrations: partial.integrations
        ? { ...this.state.integrations, ...partial.integrations }
        : this.state.integrations,
      billing: partial.billing ? { ...this.state.billing, ...partial.billing } : this.state.billing,
      team: partial.team ?? this.state.team,
    };
    return this.state;
  }
}
