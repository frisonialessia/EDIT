import type { EventId, VendorId } from './ids.js';

export type MessageId = string & { readonly __brand: 'MessageId' };

export interface Message {
  readonly id: MessageId;
  readonly eventId: EventId;
  readonly threadId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly body: string;
  readonly sentAt: string;
  readonly isSystem: boolean;
}

export interface MessageThread {
  readonly id: string;
  readonly eventId: EventId;
  readonly vendorId?: VendorId;
  readonly title: string;
  readonly lastMessage: string;
  readonly lastMessageAt: string;
  readonly unreadCount: number;
}
