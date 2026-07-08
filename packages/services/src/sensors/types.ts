import type { EventId, RiskCategory } from '@edit-os/core';

export interface SensorReading {
  readonly category: RiskCategory;
  readonly value: number;
  readonly unit: string;
  readonly message: string;
}

export interface SensorContext {
  readonly eventId: EventId;
  readonly location: string;
  readonly isOutdoor: boolean;
  readonly date: string;
}

export interface ISensorProvider {
  readonly category: RiskCategory;
  poll(context: SensorContext): Promise<SensorReading | null>;
}
