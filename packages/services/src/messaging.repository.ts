import type { EventId, Message, MessageId, MessageThread } from '@edit-os/core';
import { comoVillaGalaIds } from './fixtures/como-villa-gala.js';

function messageId(id: string): MessageId {
  return id as MessageId;
}

const seedMessages: Message[] = [
  {
    id: messageId('msg-1'),
    eventId: comoVillaGalaIds.eventId,
    threadId: 'thread-catering',
    senderId: 'system',
    senderName: 'EDIT-OS',
    body: 'Weather alert: 72% rain in 3h. Plan B proposal ready for approval.',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    isSystem: true,
  },
  {
    id: messageId('msg-2'),
    eventId: comoVillaGalaIds.eventId,
    threadId: 'thread-catering',
    senderId: 'vendor-1',
    senderName: 'Lake Como Luxury Catering',
    body: 'Received. We can deploy tents in 40 minutes or move cocktail indoors.',
    sentAt: new Date(Date.now() - 3000000).toISOString(),
    isSystem: false,
  },
  {
    id: messageId('msg-3'),
    eventId: comoVillaGalaIds.eventId,
    threadId: 'thread-dj',
    senderId: 'team-3',
    senderName: 'Luca Ferretti',
    body: 'Running 20 min late due to traffic on SP583. Adjust set start?',
    sentAt: new Date(Date.now() - 1800000).toISOString(),
    isSystem: false,
  },
  {
    id: messageId('msg-4'),
    eventId: comoVillaGalaIds.eventId,
    threadId: 'thread-staff',
    senderId: 'system',
    senderName: 'EDIT-OS',
    body: 'Staff coordination channel ready.',
    sentAt: new Date(Date.now() - 900000).toISOString(),
    isSystem: true,
  },
];

export interface IMessageRepository {
  listThreads(eventId: EventId): Promise<MessageThread[]>;
  listMessages(eventId: EventId, threadId: string): Promise<Message[]>;
  sendMessage(input: Omit<Message, 'id' | 'sentAt'>): Promise<Message>;
}

export class InMemoryMessageRepository implements IMessageRepository {
  private readonly messages: Message[] = [...seedMessages];

  async listThreads(eventId: EventId): Promise<MessageThread[]> {
    const threads = new Map<string, MessageThread>();

    for (const message of this.messages.filter((m) => m.eventId === eventId)) {
      const existing = threads.get(message.threadId);
      if (!existing || message.sentAt > existing.lastMessageAt) {
        threads.set(message.threadId, {
          id: message.threadId,
          eventId,
          title:
            message.threadId === 'thread-catering'
              ? 'Lake Como Luxury Catering'
              : message.threadId === 'thread-staff'
                ? 'Staff coordination'
                : 'Luca Ferretti · DJ',
          lastMessage: message.body,
          lastMessageAt: message.sentAt,
          unreadCount: message.isSystem ? 1 : 0,
        });
      }
    }

    return [...threads.values()].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  }

  async listMessages(eventId: EventId, threadId: string): Promise<Message[]> {
    return this.messages
      .filter((m) => m.eventId === eventId && m.threadId === threadId)
      .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  }

  async sendMessage(input: Omit<Message, 'id' | 'sentAt'>): Promise<Message> {
    const message: Message = {
      ...input,
      id: messageId(`msg-${Date.now()}`),
      sentAt: new Date().toISOString(),
    };
    this.messages.push(message);
    return message;
  }
}
