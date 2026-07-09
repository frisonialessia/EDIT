import type { Event, EventId, Vendor, VendorId } from '@edit-os/core';

export interface IEventRepository {
  findById(id: EventId): Promise<Event | undefined>;
  listAll(): Promise<Event[]>;
  create(event: Event): Promise<Event>;
  update(event: Event): Promise<Event>;
}

export interface IVendorRepository {
  findById(id: VendorId): Promise<Vendor | undefined>;
}
