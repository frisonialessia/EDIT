import type {
  DocumentId,
  DocumentTreeNode,
  DocumentVisibility,
  EventDocument,
  EventFolder,
  EventId,
  FolderId,
} from '@edit-os/core';
import type { IDocumentRepository } from './documents.repository.js';

export interface RegisterDocumentInput {
  readonly name: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly uploadedBy: string;
  readonly visibility?: DocumentVisibility;
  readonly tags?: readonly string[];
}

export interface CreateFolderInput {
  readonly name: string;
  readonly parentId?: FolderId | null;
}

export class DocumentService {
  constructor(private readonly documents: IDocumentRepository) {}

  async getTree(eventId: EventId): Promise<DocumentTreeNode[]> {
    const folders = await this.documents.listFolders(eventId);
    const allDocuments = await this.documents.listDocuments(eventId);

    const buildNode = (folder: EventFolder): DocumentTreeNode => ({
      folder,
      documents: allDocuments.filter((document) => document.folderId === folder.id),
      children: folders
        .filter((child) => child.parentId === folder.id)
        .map((child) => buildNode(child)),
    });

    return folders.filter((folder) => folder.parentId === null).map((folder) => buildNode(folder));
  }

  async listDocuments(eventId: EventId, folderId: FolderId): Promise<EventDocument[]> {
    return this.documents.listDocuments(eventId, folderId);
  }

  async createFolder(eventId: EventId, input: CreateFolderInput): Promise<EventFolder> {
    const slug = slugify(input.name);
    const folder: EventFolder = {
      id: `folder-${Date.now()}` as FolderId,
      eventId,
      parentId: input.parentId ?? null,
      name: input.name,
      slug,
      createdAt: new Date().toISOString(),
    };

    return this.documents.createFolder(folder);
  }

  async registerDocument(
    eventId: EventId,
    folderId: FolderId,
    input: RegisterDocumentInput,
  ): Promise<EventDocument> {
    const folders = await this.documents.listFolders(eventId);
    const folder = folders.find((entry) => entry.id === folderId);
    if (!folder) {
      throw new Error(`Folder not found: ${folderId as string}`);
    }

    const documentId = `doc-${Date.now()}` as DocumentId;
    const document: EventDocument = {
      id: documentId,
      eventId,
      folderId,
      name: input.name,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: `orgs/demo/events/${eventId as string}/${folder.slug}/${documentId as string}`,
      version: 1,
      uploadedBy: input.uploadedBy,
      visibility: input.visibility ?? 'internal',
      tags: input.tags ?? [],
      createdAt: new Date().toISOString(),
    };

    return this.documents.createDocument(document);
  }

  async archivePlanBSnapshot(
    eventId: EventId,
    planLabel: string,
    proposalReason: string,
  ): Promise<EventDocument> {
    const folders = await this.documents.listFolders(eventId);
    const planBFolder = folders.find((folder) => folder.slug === 'plan-b');
    if (!planBFolder) {
      throw new Error('Plan B folder not configured for event');
    }

    return this.registerDocument(eventId, planBFolder.id, {
      name: `Plan B snapshot — ${planLabel}.md`,
      mimeType: 'text/markdown',
      sizeBytes: proposalReason.length,
      uploadedBy: 'system',
      visibility: 'internal',
      tags: ['plan-b', 'auto-archive', 'orchestration'],
    });
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
