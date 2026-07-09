import type {
  DocumentId,
  EventDocument,
  EventFolder,
  EventId,
  FolderId,
} from '@edit-os/core';
import { comoVillaGalaIds } from './fixtures/como-villa-gala.js';

function folderId(id: string): FolderId {
  return id as FolderId;
}

function documentId(id: string): DocumentId {
  return id as DocumentId;
}

const seedFolders: EventFolder[] = [
  {
    id: folderId('folder-brief'),
    eventId: comoVillaGalaIds.eventId,
    parentId: null,
    name: '00 — Brief',
    slug: '00-brief',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: folderId('folder-contracts'),
    eventId: comoVillaGalaIds.eventId,
    parentId: null,
    name: '01 — Contracts',
    slug: '01-contracts',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: folderId('folder-timeline'),
    eventId: comoVillaGalaIds.eventId,
    parentId: null,
    name: '02 — Timeline',
    slug: '02-timeline',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: folderId('folder-plan-a'),
    eventId: comoVillaGalaIds.eventId,
    parentId: folderId('folder-timeline'),
    name: 'Plan A',
    slug: 'plan-a',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: folderId('folder-plan-b'),
    eventId: comoVillaGalaIds.eventId,
    parentId: folderId('folder-timeline'),
    name: 'Plan B',
    slug: 'plan-b',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
];

const seedDocuments: EventDocument[] = [
  {
    id: documentId('doc-brief'),
    eventId: comoVillaGalaIds.eventId,
    folderId: folderId('folder-brief'),
    name: 'Creative brief — Villa del Balbianello.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 2457600,
    storageKey: 'orgs/demo/events/event-1/00-brief/creative-brief-v1.pdf',
    version: 1,
    uploadedBy: 'client-1',
    visibility: 'internal',
    tags: ['brief', 'client'],
    createdAt: '2026-06-02T14:00:00.000Z',
  },
  {
    id: documentId('doc-catering-contract'),
    eventId: comoVillaGalaIds.eventId,
    folderId: folderId('folder-contracts'),
    name: 'Lake Como Luxury Catering — MSA.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 512000,
    storageKey: 'orgs/demo/events/event-1/01-contracts/catering-msa-v1.pdf',
    version: 1,
    uploadedBy: 'client-1',
    visibility: 'vendor',
    tags: ['catering', 'signed'],
    createdAt: '2026-06-05T09:30:00.000Z',
  },
  {
    id: documentId('doc-run-of-show-a'),
    eventId: comoVillaGalaIds.eventId,
    folderId: folderId('folder-plan-a'),
    name: 'Run of show — Plan A.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 890000,
    storageKey: 'orgs/demo/events/event-1/02-timeline/plan-a/run-of-show-v2.pdf',
    version: 2,
    uploadedBy: 'client-1',
    visibility: 'internal',
    tags: ['timeline', 'plan-a'],
    createdAt: '2026-08-20T11:00:00.000Z',
  },
];

export interface IDocumentRepository {
  listFolders(eventId: EventId): Promise<EventFolder[]>;
  listDocuments(eventId: EventId, folderId?: FolderId): Promise<EventDocument[]>;
  createFolder(folder: EventFolder): Promise<EventFolder>;
  createDocument(document: EventDocument): Promise<EventDocument>;
}

export class InMemoryDocumentRepository implements IDocumentRepository {
  private readonly folders: EventFolder[] = [...seedFolders];
  private readonly documents: EventDocument[] = [...seedDocuments];

  async listFolders(eventId: EventId): Promise<EventFolder[]> {
    return this.folders.filter((folder) => folder.eventId === eventId);
  }

  async listDocuments(eventId: EventId, folderId?: FolderId): Promise<EventDocument[]> {
    return this.documents.filter(
      (document) =>
        document.eventId === eventId && (folderId === undefined || document.folderId === folderId),
    );
  }

  async createFolder(folder: EventFolder): Promise<EventFolder> {
    this.folders.push(folder);
    return folder;
  }

  async createDocument(document: EventDocument): Promise<EventDocument> {
    this.documents.push(document);
    return document;
  }
}
