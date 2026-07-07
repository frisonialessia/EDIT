import type { EventStatus } from '@edit-os/core';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'critical';

export const statusToneMap: Record<EventStatus, StatusTone> = {
  draft: 'neutral',
  confirmed: 'success',
  executed: 'success',
  cancelled: 'critical',
};
