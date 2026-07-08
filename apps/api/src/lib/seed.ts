import type { InMemoryEventRepository, InMemoryVendorRepository } from '@edit-os/services';
import {
  createComoVillaGalaEvent,
  createComoVillaGalaVendor,
} from '@edit-os/services';

export async function seedDemoData(
  events: InMemoryEventRepository,
  vendors: InMemoryVendorRepository,
): Promise<void> {
  vendors.register(createComoVillaGalaVendor());
  await events.create(createComoVillaGalaEvent());
}
