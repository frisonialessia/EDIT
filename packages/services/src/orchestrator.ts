import type { Event, EventId, VendorId } from '@edit-os/core';
import {
  EventNotFoundError,
  InvalidEventStatusError,
  VendorAlreadyAssignedError,
  VendorNotFoundError,
} from './errors.js';
import type { IEventRepository, IVendorRepository } from './repository.js';

const MUTABLE_STATUSES = new Set<Event['status']>(['draft', 'confirmed']);

export interface EventOrchestratorDeps {
  readonly events: IEventRepository;
  readonly vendors: IVendorRepository;
}

export class EventOrchestrator {
  constructor(private readonly deps: EventOrchestratorDeps) {}

  async assignVendorToEvent(eventId: EventId, vendorId: VendorId): Promise<Event> {
    const event = await this.deps.events.findById(eventId);
    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    if (!MUTABLE_STATUSES.has(event.status)) {
      throw new InvalidEventStatusError(eventId, event.status);
    }

    const vendor = await this.deps.vendors.findById(vendorId);
    if (!vendor) {
      throw new VendorNotFoundError(vendorId);
    }

    if (event.vendors.some((assigned) => assigned.id === vendorId)) {
      throw new VendorAlreadyAssignedError(eventId, vendorId);
    }

    return this.deps.events.update({
      ...event,
      vendors: [...event.vendors, vendor],
    });
  }
}
