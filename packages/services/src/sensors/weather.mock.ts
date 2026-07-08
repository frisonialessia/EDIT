import type { ISensorProvider, SensorContext, SensorReading } from './types.js';

/** Simula Weather API — probabilidad de lluvia en las próximas 3 horas. */
export class MockWeatherSensor implements ISensorProvider {
  readonly category = 'weather' as const;

  async poll(context: SensorContext): Promise<SensorReading | null> {
    if (!context.isOutdoor) {
      return {
        category: 'weather',
        value: 12,
        unit: '%',
        message: 'Indoor venue — weather risk negligible.',
      };
    }

    const rainProbability = context.eventId === 'event-1' ? 72 : 35;

    return {
      category: 'weather',
      value: rainProbability,
      unit: '%',
      message: `${rainProbability}% rain probability in the next 3 hours near ${context.location}.`,
    };
  }
}
