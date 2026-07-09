import type { EventId } from '@edit-os/core';
import { describe, expect, it } from 'vitest';
import { PolicyEngine } from './policy-engine.js';
import { DEFAULT_THRESHOLDS } from './policy-defaults.js';
import { createComoVillaGalaEvent, initialWeatherProposal } from './fixtures/como-villa-gala.js';

describe('PolicyEngine', () => {
  it('returns default thresholds matching prior hardcoded values', () => {
    const engine = new PolicyEngine();
    expect(engine.getThresholds()).toEqual(DEFAULT_THRESHOLDS);
  });

  it('merges threshold overrides per org', () => {
    const engine = new PolicyEngine();
    const updated = engine.updateThresholds('org-1', {
      weather: { rainProbability: 75 },
    });

    expect(updated.weather.rainProbability).toBe(75);
    expect(updated.traffic.delayMinutes).toBe(20);
    expect(engine.getThresholds('default').weather.rainProbability).toBe(60);
  });

  it('auto-approves extreme outdoor weather proposals', () => {
    const engine = new PolicyEngine();
    const event = createComoVillaGalaEvent({
      riskProfile: {
        signals: [
          {
            category: 'weather',
            level: 'critical',
            value: 85,
            unit: '%',
            message: 'Extreme rain',
            detectedAt: new Date().toISOString(),
          },
        ],
      },
    });

    const proposal = {
      ...initialWeatherProposal,
      reason: 'Lluvia extrema',
    };

    expect(engine.shouldAutoApprove(proposal, event, event.riskProfile.signals)).toBe(true);
  });

  it('does not auto-approve moderate weather below policy minimum', () => {
    const engine = new PolicyEngine();
    const event = createComoVillaGalaEvent();

    expect(
      engine.shouldAutoApprove(initialWeatherProposal, event, event.riskProfile.signals),
    ).toBe(false);
  });

  it('auto-approves compound crisis proposals', () => {
    const engine = new PolicyEngine();
    const event = createComoVillaGalaEvent();
    const compoundProposal = {
      ...initialWeatherProposal,
      id: 'proposal-compound-1' as typeof initialWeatherProposal.id,
      trigger: 'compound' as const,
      reason: 'Crisis Tier 2',
    };

    expect(engine.shouldAutoApprove(compoundProposal, event, event.riskProfile.signals)).toBe(true);
  });

  it('records and retrieves orchestration logs', () => {
    const engine = new PolicyEngine();
    const eventId = 'event-1' as EventId;

    engine.recordLog({
      id: 'log-1',
      eventId,
      trigger: 'weather',
      decision: 'auto_approved',
      actor: 'policy-engine',
      reason: 'Test',
      timestamp: new Date().toISOString(),
    });

    expect(engine.getLogs(eventId)).toHaveLength(1);
  });
});
