import type { Brand } from './brand.js';
import type { EventId } from './ids.js';

export type FolderId = Brand<string, 'FolderId'>;
export type DocumentId = Brand<string, 'DocumentId'>;

export type DocumentVisibility = 'internal' | 'vendor' | 'client';

export interface EventFolder {
  readonly id: FolderId;
  readonly eventId: EventId;
  readonly parentId: FolderId | null;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: string;
}

export interface EventDocument {
  readonly id: DocumentId;
  readonly eventId: EventId;
  readonly folderId: FolderId;
  readonly name: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
  readonly version: number;
  readonly uploadedBy: string;
  readonly visibility: DocumentVisibility;
  readonly tags: readonly string[];
  readonly createdAt: string;
}

export interface DocumentTreeNode {
  readonly folder: EventFolder;
  readonly documents: readonly EventDocument[];
  readonly children: readonly DocumentTreeNode[];
}
