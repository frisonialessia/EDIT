import {
  createDefaultSensorProviders,
  DominoOrchestrator,
  EventOrchestrator,
  InMemoryEventRepository,
  InMemoryVendorRepository,
} from '@edit-os/services';
import { seedDemoData } from './seed.js';

export interface AppContainer {
  readonly orchestrator: EventOrchestrator;
  readonly domino: DominoOrchestrator;
  readonly events: InMemoryEventRepository;
  readonly vendors: InMemoryVendorRepository;
}

export async function createAppContainer(): Promise<AppContainer> {
  const events = new InMemoryEventRepository();
  const vendors = new InMemoryVendorRepository();
  const orchestrator = new EventOrchestrator({ events, vendors });
  const domino = new DominoOrchestrator({
    events,
    sensors: createDefaultSensorProviders(),
  });

  await seedDemoData(events, vendors);

  return { orchestrator, domino, events, vendors };
}
