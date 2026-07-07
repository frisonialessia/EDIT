import type { ClientId, EventId, VendorId } from '@edit-os/core';

export const demoIds = {
  eventId: 'event-1' as EventId,
  vendorId: 'vendor-1' as VendorId,
  clientId: 'client-1' as ClientId,
} as const;
