import type { RiskCategory, RiskLevel } from '@edit-os/core';

export function toRiskLevel(category: RiskCategory, value: number): RiskLevel {
  switch (category) {
    case 'weather':
      if (value >= 70) return 'critical';
      if (value >= 60) return 'high';
      if (value >= 40) return 'medium';
      return 'low';
    case 'traffic':
      if (value >= 30) return 'critical';
      if (value >= 20) return 'high';
      if (value >= 10) return 'medium';
      return 'low';
    case 'staff':
      if (value >= 45) return 'critical';
      if (value >= 30) return 'high';
      if (value >= 15) return 'medium';
      return 'low';
    case 'guest_flow':
      if (value >= 90) return 'critical';
      if (value >= 75) return 'high';
      if (value >= 60) return 'medium';
      return 'low';
    case 'consumption':
      if (value >= 40) return 'critical';
      if (value >= 30) return 'high';
      if (value >= 15) return 'medium';
      return 'low';
    case 'ambient':
      if (value >= 85) return 'critical';
      if (value >= 70) return 'high';
      if (value >= 55) return 'medium';
      return 'low';
  }
}
