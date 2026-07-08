import type { Client, ClientId, Event, EventId, Vendor, VendorId } from '@edit-os/core';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  EventNotFoundError,
  InvalidEventStatusError,
  VendorAlreadyAssignedError,
} from './errors.js';
import { createComoVillaGalaEvent } from './fixtures/como-villa-gala.js';
import { EventOrchestrator } from './orchestrator.js';
import {
  InMemoryEventRepository,
  InMemoryVendorRepository,
} from './repositories.memory.js';

function asEventId(id: string): EventId {
  return id as EventId;
}

function asVendorId(id: string): VendorId {
  return id as VendorId;
}

function asClientId(id: string): ClientId {
  return id as ClientId;
}

function createClient(overrides: Partial<Client> = {}): Client {
  return {
    id: asClientId('client-1'),
    name: 'Alessia Rossi',
    email: 'alessia@example.com',
    ...overrides,
  };
}

function createVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: asVendorId('vendor-1'),
    name: 'Lake Como Luxury Catering',
    category: 'catering',
    email: 'bookings@luxcatering.example',
    regions: ['EU', 'US'],
    ...overrides,
  };
}

function createEvent(overrides: Partial<Event> = {}): Event {
  return createComoVillaGalaEvent({ status: 'draft', pendingProposals: [], ...overrides });
}

describe('EventOrchestrator.assignVendorToEvent', () => {
  let events: InMemoryEventRepository;
  let vendors: InMemoryVendorRepository;
  let orchestrator: EventOrchestrator;

  beforeEach(() => {
    events = new InMemoryEventRepository();
    vendors = new InMemoryVendorRepository();
    orchestrator = new EventOrchestrator({ events, vendors });
  });

  it('assigns an existing vendor to a draft event', async () => {
    const vendor = createVendor();
    const event = createEvent();

    vendors.register(vendor);
    await events.create(event);

    const result = await orchestrator.assignVendorToEvent(event.id, vendor.id);

    expect(result.vendors).toHaveLength(1);
    expect(result.vendors[0]?.id).toBe(vendor.id);
    expect(result.vendors[0]?.name).toBe(vendor.name);
  });

  it('throws EventNotFoundError when the event does not exist', async () => {
    const vendor = createVendor();
    vendors.register(vendor);

    await expect(
      orchestrator.assignVendorToEvent(asEventId('missing-event'), vendor.id),
    ).rejects.toBeInstanceOf(EventNotFoundError);
  });

  it('throws InvalidEventStatusError when the event is executed', async () => {
    const vendor = createVendor();
    const event = createEvent({ status: 'executed' });

    vendors.register(vendor);
    await events.create(event);

    await expect(
      orchestrator.assignVendorToEvent(event.id, vendor.id),
    ).rejects.toBeInstanceOf(InvalidEventStatusError);
  });

  it('throws VendorAlreadyAssignedError when assigning the same vendor twice', async () => {
    const vendor = createVendor();
    const event = createEvent();

    vendors.register(vendor);
    await events.create(event);

    await orchestrator.assignVendorToEvent(event.id, vendor.id);

    await expect(
      orchestrator.assignVendorToEvent(event.id, vendor.id),
    ).rejects.toBeInstanceOf(VendorAlreadyAssignedError);
  });
});
