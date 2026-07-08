export type RiskCategory =
  | 'weather'
  | 'traffic'
  | 'staff'
  | 'guest_flow'
  | 'consumption'
  | 'ambient';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskSignal {
  readonly category: RiskCategory;
  readonly level: RiskLevel;
  readonly value: number;
  readonly unit: string;
  readonly message: string;
  readonly detectedAt: string;
}

export interface RiskProfile {
  readonly signals: readonly RiskSignal[];
}
