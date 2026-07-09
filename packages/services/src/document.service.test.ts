import type { EventId, FolderId } from '@edit-os/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { DocumentService } from './document.service.js';
import { InMemoryDocumentRepository } from './documents.repository.js';
import { comoVillaGalaIds } from './fixtures/como-villa-gala.js';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(() => {
    service = new DocumentService(new InMemoryDocumentRepository());
  });

  it('returns a nested folder tree for an event', async () => {
    const tree = await service.getTree(comoVillaGalaIds.eventId);

    expect(tree.length).toBeGreaterThanOrEqual(3);
    expect(tree.some((node) => node.folder.slug === '02-timeline')).toBe(true);
    expect(
      tree
        .find((node) => node.folder.slug === '02-timeline')
        ?.children.some((child) => child.folder.slug === 'plan-b'),
    ).toBe(true);
  });

  it('registers a document in a folder', async () => {
    const document = await service.registerDocument(
      comoVillaGalaIds.eventId,
      'folder-brief' as FolderId,
      {
        name: 'Floorplan draft.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        uploadedBy: 'client-1',
      },
    );

    expect(document.folderId).toBe('folder-brief');
    expect(document.storageKey).toContain('00-brief');
  });

  it('archives a Plan B snapshot into plan-b folder', async () => {
    const document = await service.archivePlanBSnapshot(
      comoVillaGalaIds.eventId,
      'Plan B — Interior',
      'Rain forecast above threshold.',
    );

    expect(document.folderId).toBe('folder-plan-b');
    expect(document.tags).toContain('auto-archive');
  });
});
