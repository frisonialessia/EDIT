import type { ClientId } from './ids.js';

export type UserRole = 'architect' | 'coordinator' | 'vendor' | 'admin';

export interface UserProfile {
  readonly id: ClientId;
  readonly name: string;
  readonly email: string;
  readonly title: string;
  readonly avatarUrl?: string;
  readonly role: UserRole;
  readonly timezone: string;
}

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly email: string;
  readonly status: 'available' | 'delayed' | 'offline';
}

export interface NotificationPreferences {
  readonly weather: boolean;
  readonly traffic: boolean;
  readonly staff: boolean;
  readonly guestFlow: boolean;
  readonly consumption: boolean;
  readonly ambient: boolean;
  readonly emailDigest: boolean;
}

export interface IntegrationConfig {
  readonly openWeatherConfigured: boolean;
  readonly googleMapsConfigured: boolean;
  readonly slackWebhook?: string;
}

export interface BillingPlan {
  readonly plan: 'studio' | 'estate' | 'enterprise';
  readonly eventsRemaining: number;
  readonly renewsAt: string;
}

export interface ProfileState {
  readonly profile: UserProfile;
  readonly team: readonly TeamMember[];
  readonly notifications: NotificationPreferences;
  readonly integrations: IntegrationConfig;
  readonly billing: BillingPlan;
}
