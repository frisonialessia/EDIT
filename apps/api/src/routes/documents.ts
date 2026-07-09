import { Hono } from 'hono';
import type { AppContainer } from '../lib/container.js';
import { asEventId, asFolderId, respondWithDomainError } from '../lib/http-errors.js';

interface RegisterDocumentBody {
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  visibility?: 'internal' | 'vendor' | 'client';
  tags?: string[];
}

interface CreateFolderBody {
  name?: string;
  parentId?: string | null;
}

export function createDocumentsRouter(container: AppContainer): Hono {
  const router = new Hono();

  router.get('/:eventId/tree', async (c) => {
    const tree = await container.documents.getTree(asEventId(c.req.param('eventId')));
    return c.json(tree, 200);
  });

  router.get('/:eventId/folders/:folderId/documents', async (c) => {
    const documents = await container.documents.listDocuments(
      asEventId(c.req.param('eventId')),
      asFolderId(c.req.param('folderId')),
    );
    return c.json(documents, 200);
  });

  router.post('/:eventId/folders', async (c) => {
    const body = await c.req.json<CreateFolderBody>().catch(() => null);

    if (!body?.name?.trim()) {
      return c.json({ error: 'name is required', code: 'INVALID_REQUEST' }, 400);
    }

    const folder = await container.documents.createFolder(asEventId(c.req.param('eventId')), {
      name: body.name.trim(),
      parentId: body.parentId ? asFolderId(body.parentId) : null,
    });

    return c.json(folder, 201);
  });

  router.post('/:eventId/folders/:folderId/documents', async (c) => {
    const body = await c.req.json<RegisterDocumentBody>().catch(() => null);

    if (!body?.name?.trim() || !body.mimeType || body.sizeBytes === undefined) {
      return c.json(
        { error: 'name, mimeType and sizeBytes are required', code: 'INVALID_REQUEST' },
        400,
      );
    }

    try {
      const document = await container.documents.registerDocument(
        asEventId(c.req.param('eventId')),
        asFolderId(c.req.param('folderId')),
        {
          name: body.name.trim(),
          mimeType: body.mimeType,
          sizeBytes: body.sizeBytes,
          uploadedBy: body.uploadedBy ?? 'user-1',
          ...(body.visibility ? { visibility: body.visibility } : {}),
          ...(body.tags ? { tags: body.tags } : {}),
        },
      );

      return c.json(document, 201);
    } catch (error) {
      const response = respondWithDomainError(c, error);
      if (response) {
        return response;
      }

      throw error;
    }
  });

  return router;
}

export function createSchedulerRouter(container: AppContainer): Hono {
  const router = new Hono();

  router.get('/status', (c) => c.json(container.scheduler.getStatus(), 200));

  router.post('/tick', async (c) => {
    const runs = await container.scheduler.tick();
    return c.json({ runs, status: container.scheduler.getStatus() }, 200);
  });

  return router;
}
