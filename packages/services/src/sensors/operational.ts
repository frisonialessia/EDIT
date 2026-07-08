import type { ISensorProvider, SensorContext, SensorReading } from './types.js';

/** Staff availability — ready for HR/check-in webhook integration. */
export class StaffSensor implements ISensorProvider {
  readonly category = 'staff' as const;

  async poll(context: SensorContext): Promise<SensorReading> {
    const delayMinutes = context.eventId === 'event-1' ? 0 : 5;

    return {
      category: 'staff',
      value: delayMinutes,
      unit: 'min',
      message:
        delayMinutes > 0
          ? `Key chef delayed ${delayMinutes} min — suplente en standby.`
          : 'All key staff on schedule.',
    };
  }
}

/** Guest flow density — ready for check-in / occupancy API. */
export class GuestFlowSensor implements ISensorProvider {
  readonly category = 'guest_flow' as const;

  async poll(_context: SensorContext): Promise<SensorReading> {
    const density = 42;

    return {
      category: 'guest_flow',
      value: density,
      unit: '%',
      message: `Cóctel zone at ${density}% capacity — flow nominal.`,
    };
  }
}

/** Premium consumption rate vs historical baseline. */
export class ConsumptionSensor implements ISensorProvider {
  readonly category = 'consumption' as const;

  async poll(_context: SensorContext): Promise<SensorReading> {
    const delta = 18;

    return {
      category: 'consumption',
      value: delta,
      unit: '%',
      message: `Nativo Vermouth consumption ${delta}% above historical pace.`,
    };
  }
}

/** Acoustic and lighting ambient sensors. */
export class AmbientSensor implements ISensorProvider {
  readonly category = 'ambient' as const;

  async poll(_context: SensorContext): Promise<SensorReading> {
    const decibels = 48;

    return {
      category: 'ambient',
      value: decibels,
      unit: 'dB',
      message: 'Ambient sound within residential threshold.',
    };
  }
}
