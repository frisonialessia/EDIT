import {
  createDefaultSensorProviders,
  createDefaultProfile,
  DominoOrchestrator,
  EventOrchestrator,
  InMemoryEventRepository,
  InMemoryMessageRepository,
  InMemoryProfileRepository,
  InMemoryVendorRepository,
} from '@edit-os/services';
import { seedDemoData } from './seed.js';

export interface AppContainer {
  readonly orchestrator: EventOrchestrator;
  readonly domino: DominoOrchestrator;
  readonly events: InMemoryEventRepository;
  readonly vendors: InMemoryVendorRepository;
  readonly profile: InMemoryProfileRepository;
  readonly messages: InMemoryMessageRepository;
}

export async function createAppContainer(): Promise<AppContainer> {
  const events = new InMemoryEventRepository();
  const vendors = new InMemoryVendorRepository();
  const messages = new InMemoryMessageRepository();
  const openWeatherApiKey = process.env['OPENWEATHER_API_KEY'];
  const googleMapsApiKey = process.env['GOOGLE_MAPS_API_KEY'];

  const orchestrator = new EventOrchestrator({ events, vendors });
  const domino = new DominoOrchestrator({
    events,
    sensors: createDefaultSensorProviders({
      ...(openWeatherApiKey ? { openWeatherApiKey } : {}),
      ...(googleMapsApiKey ? { googleMapsApiKey } : {}),
    }),
    messages,
  });
  const profile = new InMemoryProfileRepository(
    createDefaultProfile({
      openWeatherConfigured: Boolean(openWeatherApiKey),
      googleMapsConfigured: Boolean(googleMapsApiKey),
    }),
  );

  await seedDemoData(events, vendors);

  return { orchestrator, domino, events, vendors, profile, messages };
}
