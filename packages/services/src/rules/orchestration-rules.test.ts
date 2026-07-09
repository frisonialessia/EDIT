import { describe, expect, it } from 'vitest';
import { createComoVillaGalaEvent, initialWeatherProposal } from '../fixtures/como-villa-gala.js';
import { DEFAULT_THRESHOLDS } from '../policy-defaults.js';
import {
  evaluateCompoundRule,
  evaluateTrafficRule,
  evaluateWeatherRule,
} from './orchestration-rules.js';

describe('orchestration-rules', () => {
  const now = new Date().toISOString();

  it('evaluates weather rule using policy thresholds', () => {
    const event = createComoVillaGalaEvent({ pendingProposals: [] });
    const signal = event.riskProfile.signals.find((s) => s.category === 'weather')!;

    const proposal = evaluateWeatherRule(event, signal, now, DEFAULT_THRESHOLDS);
    expect(proposal?.trigger).toBe('weather');
  });

  it('skips weather rule below threshold', () => {
    const event = createComoVillaGalaEvent({ pendingProposals: [], isOutdoor: true });
    const signal = {
      category: 'weather' as const,
      level: 'low' as const,
      value: 40,
      unit: '%',
      message: 'Low rain',
      detectedAt: now,
    };

    expect(evaluateWeatherRule(event, signal, now, DEFAULT_THRESHOLDS)).toBeNull();
  });

  it('evaluates compound crisis when weather and traffic are both high', () => {
    const event = createComoVillaGalaEvent({ pendingProposals: [] });
    const proposal = evaluateCompoundRule(event, event.riskProfile.signals, DEFAULT_THRESHOLDS, now);

    expect(proposal?.trigger).toBe('compound');
    expect(proposal?.reason).toContain('Crisis Tier 2');
    expect(proposal?.actions.length).toBeGreaterThan(2);
  });

  it('does not create compound proposal when only one signal is high', () => {
    const event = createComoVillaGalaEvent({ pendingProposals: [] });
    const signals = event.riskProfile.signals.map((s) =>
      s.category === 'traffic' ? { ...s, value: 5 } : s,
    );

    expect(evaluateCompoundRule(event, signals, DEFAULT_THRESHOLDS, now)).toBeNull();
  });

  it('does not duplicate traffic proposal when one is pending', () => {
    const event = createComoVillaGalaEvent({
      pendingProposals: [
        {
          id: 'proposal-traffic-pending' as typeof initialWeatherProposal.id,
          trigger: 'traffic',
          reason: 'Existing traffic proposal',
          planB: createComoVillaGalaEvent().contingencyPlans.find((p) => p.variant === 'B')!,
          actions: [],
          status: 'pending',
          createdAt: now,
        },
      ],
    });
    const trafficSignal = event.riskProfile.signals.find((s) => s.category === 'traffic')!;

    expect(evaluateTrafficRule(event, trafficSignal, now, DEFAULT_THRESHOLDS)).toBeNull();
  });
});
