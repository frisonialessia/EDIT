import type { Client } from './client.js';
import type { EventStatus } from './event-status.js';
import type { EventId } from './ids.js';
import type { Vendor } from './vendor.js';

export interface Event {
  readonly id: EventId;
  readonly name: string;
  /** Fecha del evento en formato ISO 8601 (YYYY-MM-DD). */
  readonly date: string;
  readonly status: EventStatus;
  readonly client: Client;
  readonly vendors: readonly Vendor[];
}
