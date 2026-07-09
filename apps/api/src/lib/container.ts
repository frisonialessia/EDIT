import {
  createDefaultSensorProviders,
  createDefaultProfile,
  DocumentService,
  DominoOrchestrator,
  EvaluationScheduler,
  EventOrchestrator,
  InMemoryDocumentRepository,
  InMemoryEventRepository,
  InMemoryMessageRepository,
  InMemoryProfileRepository,
  InMemoryVendorRepository,
} from '@edit-os/services';
import { seedDemoData } from './seed.js';

export interface AppContainer {
  readonly orchestrator: EventOrchestrator;
  readonly domino: DominoOrchestrator;
  readonly scheduler: EvaluationScheduler;
  readonly events: InMemoryEventRepository;
  readonly vendors: InMemoryVendorRepository;
  readonly profile: InMemoryProfileRepository;
  readonly messages: InMemoryMessageRepository;
  readonly documents: DocumentService;
}

export async function createAppContainer(): Promise<AppContainer> {
  const events = new InMemoryEventRepository();
  const vendors = new InMemoryVendorRepository();
  const messages = new InMemoryMessageRepository();
  const documentRepository = new InMemoryDocumentRepository();
  const documents = new DocumentService(documentRepository);
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
    documents,
  });
  const scheduler = new EvaluationScheduler({
    events,
    domino,
    intervalMs: Number(process.env['SCHEDULER_INTERVAL_MS'] ?? 60_000),
  });
  const profile = new InMemoryProfileRepository(
    createDefaultProfile({
      openWeatherConfigured: Boolean(openWeatherApiKey),
      googleMapsConfigured: Boolean(googleMapsApiKey),
    }),
  );

  await seedDemoData(events, vendors);

  if (process.env['SCHEDULER_ENABLED'] !== 'false') {
    scheduler.start();
  }

  return { orchestrator, domino, scheduler, events, vendors, profile, messages, documents };
}
