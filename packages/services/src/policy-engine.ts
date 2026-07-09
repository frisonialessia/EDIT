import type {
  Event,
  EventId,
  OrchestrationLog,
  OrchestrationPolicy,
  PolicyProposalContext,
  PolicyThresholds,
  RiskSignal,
  WorkflowProposal,
} from '@edit-os/core';
import { DEFAULT_AUTO_APPROVE_RULES, DEFAULT_THRESHOLDS } from './policy-defaults.js';

export { DEFAULT_AUTO_APPROVE_RULES, DEFAULT_THRESHOLDS } from './policy-defaults.js';

export class PolicyEngine {
  private readonly thresholdOverrides = new Map<string, PolicyThresholds>();
  private readonly logs = new Map<EventId, OrchestrationLog[]>();

  getThresholds(orgId = 'default'): PolicyThresholds {
    return this.thresholdOverrides.get(orgId) ?? DEFAULT_THRESHOLDS;
  }

  getPolicy(orgId = 'default'): OrchestrationPolicy {
    return {
      orgId,
      thresholds: this.getThresholds(orgId),
      autoApproveRules: DEFAULT_AUTO_APPROVE_RULES,
      compoundRulesEnabled: true,
    };
  }

  updateThresholds(orgId: string, partial: Partial<PolicyThresholds>): PolicyThresholds {
    const merged = mergeThresholds(this.getThresholds(orgId), partial);
    this.thresholdOverrides.set(orgId, merged);
    return merged;
  }

  shouldAutoApprove(
    proposal: WorkflowProposal,
    event: Event,
    signals: readonly RiskSignal[],
  ): boolean {
    return this.shouldAutoApproveContext({
      proposal,
      isOutdoor: event.isOutdoor,
      signals,
    });
  }

  shouldAutoApproveContext(context: PolicyProposalContext): boolean {
    const policy = this.getPolicy();

    if (context.proposal.trigger === 'compound') {
      return policy.autoApproveRules.some(
        (rule) => rule.enabled && rule.trigger === 'compound',
      );
    }

    const signal = context.signals.find((s) => s.category === context.proposal.trigger);
    if (!signal) {
      return false;
    }

    return policy.autoApproveRules.some((rule) => {
      if (!rule.enabled || rule.trigger !== context.proposal.trigger) {
        return false;
      }

      if (rule.requiresOutdoor && !context.isOutdoor) {
        return false;
      }

      return signal.value >= rule.minValue;
    });
  }

  recordLog(entry: OrchestrationLog): void {
    const existing = this.logs.get(entry.eventId) ?? [];
    this.logs.set(entry.eventId, [...existing, entry]);
  }

  getLogs(eventId: EventId): readonly OrchestrationLog[] {
    return this.logs.get(eventId) ?? [];
  }
}

function mergeThresholds(
  base: PolicyThresholds,
  overrides: Partial<PolicyThresholds>,
): PolicyThresholds {
  return {
    weather: { ...base.weather, ...overrides.weather },
    traffic: { ...base.traffic, ...overrides.traffic },
    staff: { ...base.staff, ...overrides.staff },
    guest_flow: { ...base.guest_flow, ...overrides.guest_flow },
    consumption: { ...base.consumption, ...overrides.consumption },
    ambient: { ...base.ambient, ...overrides.ambient },
  };
}
