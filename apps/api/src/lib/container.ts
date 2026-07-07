import {
  EventOrchestrator,
  InMemoryEventRepository,
  InMemoryVendorRepository,
} from '@edit-os/services';
import { seedDemoData } from './seed.js';

export interface AppContainer {
  readonly orchestrator: EventOrchestrator;
  readonly events: InMemoryEventRepository;
  readonly vendors: InMemoryVendorRepository;
}

export async function createAppContainer(): Promise<AppContainer> {
  const events = new InMemoryEventRepository();
  const vendors = new InMemoryVendorRepository();
  const orchestrator = new EventOrchestrator({ events, vendors });

  await seedDemoData(events, vendors);

  return { orchestrator, events, vendors };
}
