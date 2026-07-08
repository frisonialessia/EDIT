import type { ISensorProvider, SensorContext, SensorReading } from './types.js';

interface DirectionsResponse {
  routes?: Array<{
    legs?: Array<{
      duration?: { value: number };
      duration_in_traffic?: { value: number };
    }>;
  }>;
  status?: string;
}

/** Google Directions API — delay vs baseline duration when GOOGLE_MAPS_API_KEY is set. */
export class GoogleTrafficSensor implements ISensorProvider {
  readonly category = 'traffic' as const;

  constructor(private readonly apiKey: string | undefined) {}

  async poll(context: SensorContext): Promise<SensorReading | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
      url.searchParams.set('origin', 'Milano Centrale');
      url.searchParams.set('destination', context.location);
      url.searchParams.set('departure_time', 'now');
      url.searchParams.set('key', this.apiKey);

      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as DirectionsResponse;
      if (data.status !== 'OK' || !data.routes?.[0]?.legs?.[0]) {
        return null;
      }

      const leg = data.routes[0].legs[0];
      const baseSeconds = leg.duration?.value ?? 0;
      const trafficSeconds = leg.duration_in_traffic?.value ?? baseSeconds;
      const delayMinutes = Math.max(0, Math.round((trafficSeconds - baseSeconds) / 60));

      return {
        category: 'traffic',
        value: delayMinutes,
        unit: 'min',
        message: `Guest transport delayed ${delayMinutes} min (Google Maps) to ${context.location}.`,
      };
    } catch {
      return null;
    }
  }
}
