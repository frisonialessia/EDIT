import type { VendorId } from './ids.js';

export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'floristry'
  | 'entertainment'
  | 'transport'
  | 'accommodation'
  | 'other';

export interface Vendor {
  readonly id: VendorId;
  readonly name: string;
  readonly category: VendorCategory;
  readonly email: string;
  readonly phone?: string;
  readonly regions: readonly string[];
}
