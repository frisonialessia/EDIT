import type { ISensorProvider, SensorContext, SensorReading } from './types.js';

/** Simula Maps API — retraso en rutas hacia el venue. */
export class MockTrafficSensor implements ISensorProvider {
  readonly category = 'traffic' as const;

  async poll(context: SensorContext): Promise<SensorReading | null> {
    const delayMinutes = context.eventId === 'event-1' ? 25 : 8;

    return {
      category: 'traffic',
      value: delayMinutes,
      unit: 'min',
      message: `Guest transport delayed ${delayMinutes} min on routes to ${context.location}.`,
    };
  }
}
