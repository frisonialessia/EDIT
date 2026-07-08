import { MockTrafficSensor } from './traffic.mock.js';
import type { ISensorProvider } from './types.js';
import { MockWeatherSensor } from './weather.mock.js';

export type { ISensorProvider, SensorContext, SensorReading } from './types.js';
export { MockTrafficSensor } from './traffic.mock.js';
export { MockWeatherSensor } from './weather.mock.js';

export function createDefaultSensorProviders(): readonly ISensorProvider[] {
  return [new MockWeatherSensor(), new MockTrafficSensor()];
}
