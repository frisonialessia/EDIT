import type { EventId, EventStatus, VendorId } from '@edit-os/core';

export class EventNotFoundError extends Error {
  constructor(readonly eventId: EventId) {
    super(`Event not found: ${eventId as string}`);
    this.name = 'EventNotFoundError';
  }
}

export class VendorNotFoundError extends Error {
  constructor(readonly vendorId: VendorId) {
    super(`Vendor not found: ${vendorId as string}`);
    this.name = 'VendorNotFoundError';
  }
}

export class InvalidEventStatusError extends Error {
  constructor(
    readonly eventId: EventId,
    readonly status: EventStatus,
  ) {
    super(`Cannot modify event ${eventId as string} in status "${status}"`);
    this.name = 'InvalidEventStatusError';
  }
}

export class VendorAlreadyAssignedError extends Error {
  constructor(
    readonly eventId: EventId,
    readonly vendorId: VendorId,
  ) {
    super(`Vendor ${vendorId as string} is already assigned to event ${eventId as string}`);
    this.name = 'VendorAlreadyAssignedError';
  }
}
