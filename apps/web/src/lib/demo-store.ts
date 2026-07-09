import type { ActionExecutionRecord, Event, Message, OrchestrationLog, OrchestrationPolicy, ProfileState } from '@edit-os/core';
import type { DocumentTreeNode } from '@edit-os/core';
import type { WorkflowProposalId } from '@edit-os/core';
import { DEFAULT_AUTO_APPROVE_RULES, DEFAULT_THRESHOLDS } from '@edit-os/core';
import { appendPlanBSnapshot, getDemoDocumentTree } from './demo-documents';
import { createDemoEvent, demoMessages, demoProfile, demoThreads } from './demo-data';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const VENDOR_THREADS: Record<string, string> = {
  catering: 'thread-catering',
  entertainment: 'thread-dj',
  bar: 'thread-catering',
};

const demoPolicy: OrchestrationPolicy = {
  orgId: 'default',
  thresholds: DEFAULT_THRESHOLDS,
  autoApproveRules: DEFAULT_AUTO_APPROVE_RULES,
  compoundRulesEnabled: true,
};

let eventState = createDemoEvent();
let profileState = clone(demoProfile);
const messagesState = clone(demoMessages);
let documentTreeState = getDemoDocumentTree();
const policyLogs: OrchestrationLog[] = [];

function recordDemoAction(
  action: ActionExecutionRecord['action'],
  outcome: string,
): ActionExecutionRecord {
  return {
    action,
    status: 'completed',
    executedAt: new Date().toISOString(),
    outcome,
  };
}

function pushDemoSystemMessage(threadId: string, body: string): void {
  if (!messagesState[threadId]) {
    messagesState[threadId] = [];
  }

  messagesState[threadId]!.push({
    id: `msg-${Date.now()}-${threadId}` as Message['id'],
    eventId: eventState.id,
    threadId,
    senderId: 'system',
    senderName: 'EDIT-OS Orchestrator',
    body,
    sentAt: new Date().toISOString(),
    isSystem: true,
  });
}

function shouldAutoApproveCompound(): boolean {
  const weather = eventState.riskProfile.signals.find((s) => s.category === 'weather');
  const traffic = eventState.riskProfile.signals.find((s) => s.category === 'traffic');

  return Boolean(
    eventState.isOutdoor &&
      weather &&
      traffic &&
      weather.value > demoPolicy.thresholds.weather.rainProbability &&
      traffic.value > demoPolicy.thresholds.traffic.delayMinutes,
  );
}

function applyProposal(proposalId: string, actor: 'manual' | 'policy-engine'): Event {
  const proposal = eventState.pendingProposals.find((p) => p.id === proposalId);
  if (!proposal) {
    return clone(eventState);
  }

  const executionRecords = proposal.actions.map((action) => {
    if (action.type === 'notify_vendor') {
      const threadId = VENDOR_THREADS[action.target] ?? `thread-${action.target}`;
      pushDemoSystemMessage(threadId, `[Auto] ${action.detail}`);
      return recordDemoAction(action, `Notification sent to ${action.target}.`);
    }

    if (action.type === 'alert_staff') {
      pushDemoSystemMessage('thread-staff', `[Staff alert · ${action.target}] ${action.detail}`);
      return recordDemoAction(action, `Staff alert dispatched to ${action.target}.`);
    }

    if (action.type === 'shift_timeline') {
      return recordDemoAction(action, `Timeline shift recorded for ${action.target}.`);
    }

    return recordDemoAction(action, `Plan B activated for event ${action.target}.`);
  });

  const logEntry: OrchestrationLog = {
    id: `log-${Date.now()}-approve`,
    eventId: eventState.id,
    trigger: proposal.trigger,
    decision: actor === 'policy-engine' ? 'auto_approved' : 'manual_approved',
    actor,
    reason: proposal.reason,
    proposalId: proposal.id,
    timestamp: new Date().toISOString(),
  };

  policyLogs.push(logEntry);

  eventState = {
    ...eventState,
    activePlan: proposal.planB.variant,
    timeline: proposal.planB.blocks.length > 0 ? proposal.planB.blocks : eventState.timeline,
    pendingProposals: eventState.pendingProposals.filter((p) => p.id !== proposalId),
    actionHistory: [...eventState.actionHistory, ...executionRecords],
    orchestrationLogs: [...eventState.orchestrationLogs, logEntry],
  };

  if (proposal.planB.variant === 'B') {
    appendPlanBSnapshot(eventState.id, proposal.planB.label);
    documentTreeState = getDemoDocumentTree();
  }

  return clone(eventState);
}

export const demoStore = {
  getEvent(): Event {
    return clone(eventState);
  },

  getPolicies(): {
    policy: OrchestrationPolicy;
    logs: OrchestrationLog[];
    eventLogs: readonly OrchestrationLog[];
  } {
    return {
      policy: clone(demoPolicy),
      logs: clone(policyLogs),
      eventLogs: clone(eventState.orchestrationLogs),
    };
  },

  approveProposal(proposalId: string): Event {
    return applyProposal(proposalId, 'manual');
  },

  rejectProposal(proposalId: string): Event {
    const proposal = eventState.pendingProposals.find((p) => p.id === proposalId);
    if (!proposal) {
      return clone(eventState);
    }

    const logEntry: OrchestrationLog = {
      id: `log-${Date.now()}-reject`,
      eventId: eventState.id,
      trigger: proposal.trigger,
      decision: 'rejected',
      actor: 'manual',
      reason: proposal.reason,
      proposalId: proposal.id,
      timestamp: new Date().toISOString(),
    };

    policyLogs.push(logEntry);
    eventState = {
      ...eventState,
      pendingProposals: eventState.pendingProposals.filter((p) => p.id !== proposalId),
      orchestrationLogs: [...eventState.orchestrationLogs, logEntry],
    };
    return clone(eventState);
  },

  evaluateEvent(): Event {
    const now = new Date().toISOString();
    const refreshedSignals = eventState.riskProfile.signals.map((signal) => ({
      ...signal,
      detectedAt: now,
    }));

    let nextProposals = [...eventState.pendingProposals];

    if (shouldAutoApproveCompound() && !nextProposals.some((p) => p.trigger === 'compound')) {
      const weather = refreshedSignals.find((s) => s.category === 'weather')!;
      const traffic = refreshedSignals.find((s) => s.category === 'traffic')!;
      const compoundProposal = {
        id: `proposal-compound-${Date.now()}` as WorkflowProposalId,
        trigger: 'compound' as const,
        reason: `Crisis Tier 2: lluvia al ${weather.value}% y retraso de ${traffic.value} min — activación coordinada Plan B.`,
        planB: eventState.contingencyPlans.find((p) => p.variant === 'B')!,
        actions: [
          {
            type: 'notify_vendor' as const,
            target: 'catering',
            detail: 'Crisis Tier 2: activar interior + desplazar servicio por tráfico.',
          },
          {
            type: 'shift_timeline' as const,
            target: 'montaje',
            detail: 'Adelantar montaje 45 min y retrasar cóctel +30 min.',
          },
          {
            type: 'notify_vendor' as const,
            target: 'entertainment',
            detail: 'Avisar DJ para ajustar set tras retraso de invitados.',
          },
          {
            type: 'activate_plan_b' as const,
            target: eventState.id as string,
            detail: 'Plan B — Crisis Tier 2 (clima + tráfico)',
          },
        ],
        status: 'pending' as const,
        createdAt: now,
      };

      nextProposals = [
        ...nextProposals.filter((p) => p.trigger !== 'weather' && p.trigger !== 'traffic'),
        compoundProposal,
      ];

      policyLogs.push({
        id: `log-${Date.now()}-compound`,
        eventId: eventState.id,
        trigger: 'compound',
        decision: 'proposed',
        actor: 'domino-orchestrator',
        reason: compoundProposal.reason,
        proposalId: compoundProposal.id,
        timestamp: now,
      });
    } else {
      const hasTrafficProposal = nextProposals.some((p) => p.trigger === 'traffic');
      if (!hasTrafficProposal) {
        nextProposals = [
          ...nextProposals,
          {
            id: `proposal-traffic-${Date.now()}` as WorkflowProposalId,
            trigger: 'traffic' as const,
            reason: 'Retraso de 25 min en rutas de invitados — recalcular cadena de servicios.',
            planB: eventState.contingencyPlans.find((p) => p.variant === 'B')!,
            actions: [
              {
                type: 'shift_timeline' as const,
                target: 'cóctel',
                detail: 'Retrasar inicio del cóctel +30 min.',
              },
              {
                type: 'notify_vendor' as const,
                target: 'catering',
                detail: 'Avisar cocina para desplazar servicio.',
              },
              {
                type: 'notify_vendor' as const,
                target: 'entertainment',
                detail: 'Avisar DJ para ajustar set programado.',
              },
            ],
            status: 'pending' as const,
            createdAt: now,
          },
        ];
      }
    }

    eventState = {
      ...eventState,
      pendingProposals: nextProposals,
      riskProfile: { signals: refreshedSignals },
    };

    const compoundPending = eventState.pendingProposals.find((p) => p.trigger === 'compound');
    if (compoundPending) {
      return applyProposal(compoundPending.id as string, 'policy-engine');
    }

    return clone(eventState);
  },

  getDocumentTree(): DocumentTreeNode[] {
    return clone(documentTreeState);
  },

  getProfile(): ProfileState {
    return clone(profileState);
  },

  updateProfile(partial: Partial<ProfileState>): ProfileState {
    profileState = {
      ...profileState,
      ...partial,
      profile: partial.profile ? { ...profileState.profile, ...partial.profile } : profileState.profile,
      notifications: partial.notifications
        ? { ...profileState.notifications, ...partial.notifications }
        : profileState.notifications,
    };
    return clone(profileState);
  },

  getThreads() {
    return clone(demoThreads);
  },

  getMessages(threadId: string): Message[] {
    return clone(messagesState[threadId] ?? []);
  },

  sendMessage(threadId: string, body: string): Message {
    const message: Message = {
      id: `msg-${Date.now()}` as Message['id'],
      eventId: eventState.id,
      threadId,
      senderId: 'user-1',
      senderName: 'Alessia Rossi',
      body,
      sentAt: new Date().toISOString(),
      isSystem: false,
    };

    if (!messagesState[threadId]) {
      messagesState[threadId] = [];
    }
    messagesState[threadId]!.push(message);
    return clone(message);
  },
};
