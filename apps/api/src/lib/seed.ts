import type { Client, Event, Vendor } from '@edit-os/core';
import type {
  InMemoryEventRepository,
  InMemoryVendorRepository,
} from '@edit-os/services';
import { demoIds } from './demo-data.js';

export async function seedDemoData(
  events: InMemoryEventRepository,
  vendors: InMemoryVendorRepository,
): Promise<void> {
  const vendor: Vendor = {
    id: demoIds.vendorId,
    name: 'Lake Como Luxury Catering',
    category: 'catering',
    email: 'bookings@luxcatering.example',
    regions: ['EU', 'US'],
  };

  const client: Client = {
    id: demoIds.clientId,
    name: 'Alessia Rossi',
    email: 'alessia@example.com',
  };

  const event: Event = {
    id: demoIds.eventId,
    name: 'Como Villa Gala',
    date: '2026-09-15',
    status: 'draft',
    client,
    vendors: [],
  };

  vendors.register(vendor);
  await events.create(event);
}
