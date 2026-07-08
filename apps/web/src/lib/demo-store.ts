import type { Event, Message, ProfileState } from '@edit-os/core';
import { createDemoEvent, demoMessages, demoProfile, demoThreads } from './demo-data';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let eventState = createDemoEvent();
let profileState = clone(demoProfile);
const messagesState = clone(demoMessages);

export const demoStore = {
  getEvent(): Event {
    return clone(eventState);
  },

  approveProposal(proposalId: string): Event {
    const proposal = eventState.pendingProposals.find((p) => p.id === proposalId);
    if (!proposal) {
      return clone(eventState);
    }

    eventState = {
      ...eventState,
      activePlan: proposal.planB.variant,
      timeline: proposal.planB.blocks.length > 0 ? proposal.planB.blocks : eventState.timeline,
      pendingProposals: eventState.pendingProposals.filter((p) => p.id !== proposalId),
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
