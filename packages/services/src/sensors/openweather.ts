import type { ISensorProvider, SensorContext, SensorReading } from './types.js';

const COMO_COORDS = { lat: 45.9619, lon: 9.2024 };

interface ForecastResponse {
  list?: Array<{ pop?: number }>;
}

/** OpenWeather 3h forecast — uses real API when OPENWEATHER_API_KEY is set. */
export class OpenWeatherSensor implements ISensorProvider {
  readonly category = 'weather' as const;

  constructor(private readonly apiKey: string | undefined) {}

  async poll(context: SensorContext): Promise<SensorReading | null> {
    if (!context.isOutdoor) {
      return {
        category: 'weather',
        value: 12,
        unit: '%',
        message: 'Indoor venue — weather risk negligible.',
      };
    }

    if (!this.apiKey) {
      return null;
    }

    try {
      const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
      url.searchParams.set('lat', String(COMO_COORDS.lat));
      url.searchParams.set('lon', String(COMO_COORDS.lon));
      url.searchParams.set('appid', this.apiKey);
      url.searchParams.set('units', 'metric');

      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as ForecastResponse;
      const nextThree = data.list?.slice(0, 1) ?? [];
      const maxPop = Math.max(...nextThree.map((entry) => (entry.pop ?? 0) * 100), 0);
      const rainProbability = Math.round(maxPop);

      return {
        category: 'weather',
        value: rainProbability,
        unit: '%',
        message: `${rainProbability}% rain probability (OpenWeather) near ${context.location}.`,
      };
    } catch {
      return null;
    }
  }
}
