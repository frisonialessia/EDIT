import type { DocumentTreeNode, EventDocument, EventId, FolderId } from '@edit-os/core';
import { DEMO_EVENT_ID } from './demo-data';

export const demoDocumentTree: DocumentTreeNode[] = [
  {
    folder: {
      id: 'folder-brief' as FolderId,
      eventId: DEMO_EVENT_ID,
      parentId: null,
      name: '00 — Brief',
      slug: '00-brief',
      createdAt: '2026-06-01T10:00:00.000Z',
    },
    documents: [
      {
        id: 'doc-brief' as EventDocument['id'],
        eventId: DEMO_EVENT_ID,
        folderId: 'folder-brief' as FolderId,
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
    ],
    children: [],
  },
  {
    folder: {
      id: 'folder-contracts' as FolderId,
      eventId: DEMO_EVENT_ID,
      parentId: null,
      name: '01 — Contracts',
      slug: '01-contracts',
      createdAt: '2026-06-01T10:00:00.000Z',
    },
    documents: [
      {
        id: 'doc-catering-contract' as EventDocument['id'],
        eventId: DEMO_EVENT_ID,
        folderId: 'folder-contracts' as FolderId,
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
    ],
    children: [],
  },
  {
    folder: {
      id: 'folder-timeline' as FolderId,
      eventId: DEMO_EVENT_ID,
      parentId: null,
      name: '02 — Timeline',
      slug: '02-timeline',
      createdAt: '2026-06-01T10:00:00.000Z',
    },
    documents: [],
    children: [
      {
        folder: {
          id: 'folder-plan-a' as FolderId,
          eventId: DEMO_EVENT_ID,
          parentId: 'folder-timeline' as FolderId,
          name: 'Plan A',
          slug: 'plan-a',
          createdAt: '2026-06-01T10:00:00.000Z',
        },
        documents: [
          {
            id: 'doc-run-of-show-a' as EventDocument['id'],
            eventId: DEMO_EVENT_ID,
            folderId: 'folder-plan-a' as FolderId,
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
        ],
        children: [],
      },
      {
        folder: {
          id: 'folder-plan-b' as FolderId,
          eventId: DEMO_EVENT_ID,
          parentId: 'folder-timeline' as FolderId,
          name: 'Plan B',
          slug: 'plan-b',
          createdAt: '2026-06-01T10:00:00.000Z',
        },
        documents: [],
        children: [],
      },
    ],
  },
];

function cloneDocumentTree(): DocumentTreeNode[] {
  return JSON.parse(JSON.stringify(demoDocumentTree)) as DocumentTreeNode[];
}

let mutableDocumentTree = cloneDocumentTree();

export function getDemoDocumentTree(): DocumentTreeNode[] {
  return clone(mutableDocumentTree);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function resetDemoDocumentTree(): void {
  mutableDocumentTree = cloneDocumentTree();
}

export function appendPlanBSnapshot(eventId: EventId, planLabel: string): void {
  const newDocument: EventDocument = {
    id: `doc-plan-b-${Date.now()}` as EventDocument['id'],
    eventId,
    folderId: 'folder-plan-b' as FolderId,
    name: `Plan B snapshot — ${planLabel}.md`,
    mimeType: 'text/markdown',
    sizeBytes: 128,
    storageKey: `orgs/demo/events/${eventId as string}/02-timeline/plan-b/snapshot.md`,
    version: 1,
    uploadedBy: 'system',
    visibility: 'internal',
    tags: ['plan-b', 'auto-archive', 'orchestration'],
    createdAt: new Date().toISOString(),
  };

  mutableDocumentTree = mutableDocumentTree.map((node) => {
    if (node.folder.slug !== '02-timeline') {
      return node;
    }

    return {
      ...node,
      children: node.children.map((child) =>
        child.folder.slug === 'plan-b'
          ? { ...child, documents: [...child.documents, newDocument] }
          : child,
      ),
    };
  });
}
