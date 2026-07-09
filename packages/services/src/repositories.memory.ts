import type { Event, EventId, Vendor, VendorId } from '@edit-os/core';
import type { IEventRepository, IVendorRepository } from './repository.js';

export class InMemoryEventRepository implements IEventRepository {
  private readonly events = new Map<EventId, Event>();

  async findById(id: EventId): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async listAll(): Promise<Event[]> {
    return [...this.events.values()];
  }

  async create(event: Event): Promise<Event> {
    if (this.events.has(event.id)) {
      throw new Error(`Event already exists: ${event.id as string}`);
    }

    this.events.set(event.id, event);
    return event;
  }

  async update(event: Event): Promise<Event> {
    if (!this.events.has(event.id)) {
      throw new Error(`Event not found: ${event.id as string}`);
    }

    this.events.set(event.id, event);
    return event;
  }
}

export class InMemoryVendorRepository implements IVendorRepository {
  private readonly vendors = new Map<VendorId, Vendor>();

  async findById(id: VendorId): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  register(vendor: Vendor): void {
    this.vendors.set(vendor.id, vendor);
  }
}
