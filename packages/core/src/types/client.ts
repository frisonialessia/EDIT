import type { ClientId } from './ids.js';

export interface Client {
  readonly id: ClientId;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly company?: string;
}
