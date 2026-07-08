import { AmbientSensor, ConsumptionSensor, GuestFlowSensor, StaffSensor } from './operational.js';
import { GoogleTrafficSensor } from './google-traffic.js';
import { OpenWeatherSensor } from './openweather.js';
import { MockTrafficSensor } from './traffic.mock.js';
import type { ISensorProvider } from './types.js';
import { MockWeatherSensor } from './weather.mock.js';

export type { ISensorProvider, SensorContext, SensorReading } from './types.js';
export { MockTrafficSensor } from './traffic.mock.js';
export { MockWeatherSensor } from './weather.mock.js';
export { OpenWeatherSensor } from './openweather.js';
export { GoogleTrafficSensor } from './google-traffic.js';

export interface SensorEnvConfig {
  readonly openWeatherApiKey?: string;
  readonly googleMapsApiKey?: string;
}

async function withFallback(
  primary: ISensorProvider,
  fallback: ISensorProvider,
  context: Parameters<ISensorProvider['poll']>[0],
): Promise<Awaited<ReturnType<ISensorProvider['poll']>>> {
  const reading = await primary.poll(context);
  if (reading) {
    return reading;
  }
  return fallback.poll(context);
}

function compositeSensor(
  category: ISensorProvider['category'],
  primary: ISensorProvider,
  fallback: ISensorProvider,
): ISensorProvider {
  return {
    category,
    poll: (context) => withFallback(primary, fallback, context),
  };
}

export function createDefaultSensorProviders(env: SensorEnvConfig = {}): readonly ISensorProvider[] {
  const weatherPrimary = new OpenWeatherSensor(env.openWeatherApiKey);
  const weatherFallback = new MockWeatherSensor();
  const trafficPrimary = new GoogleTrafficSensor(env.googleMapsApiKey);
  const trafficFallback = new MockTrafficSensor();

  return [
    compositeSensor('weather', weatherPrimary, weatherFallback),
    compositeSensor('traffic', trafficPrimary, trafficFallback),
    new StaffSensor(),
    new GuestFlowSensor(),
    new ConsumptionSensor(),
    new AmbientSensor(),
  ];
}
