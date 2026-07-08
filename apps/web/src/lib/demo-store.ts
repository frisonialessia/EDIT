import type { ActionExecutionRecord, Event, Message, ProfileState } from '@edit-os/core';
import { createDemoEvent, demoMessages, demoProfile, demoThreads } from './demo-data';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const VENDOR_THREADS: Record<string, string> = {
  catering: 'thread-catering',
  entertainment: 'thread-dj',
  bar: 'thread-catering',
};

let eventState = createDemoEvent();
let profileState = clone(demoProfile);
const messagesState = clone(demoMessages);

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

export const demoStore = {
  getEvent(): Event {
    return clone(eventState);
  },

  approveProposal(proposalId: string): Event {
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

    eventState = {
      ...eventState,
      activePlan: proposal.planB.variant,
      timeline: proposal.planB.blocks.length > 0 ? proposal.planB.blocks : eventState.timeline,
      pendingProposals: eventState.pendingProposals.filter((p) => p.id !== proposalId),
      actionHistory: [...eventState.actionHistory, ...executionRecords],
    };

    return clone(eventState);
  },

  rejectProposal(proposalId: string): Event {
    eventState = {
      ...eventState,
      pendingProposals: eventState.pendingProposals.filter((p) => p.id !== proposalId),
    };
    return clone(eventState);
  },

  evaluateEvent(): Event {
    return clone(eventState);
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
