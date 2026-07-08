import { Hono } from 'hono';
import type { AppContainer } from '../lib/container.js';
import { respondWithDomainError } from '../lib/http-errors.js';

export function createProfileRouter(container: AppContainer): Hono {
  const router = new Hono();

  router.get('/', async (c) => {
    const profile = await container.profile.get();
    return c.json(profile, 200);
  });

  router.patch('/', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const profile = await container.profile.update(body);
    return c.json(profile, 200);
  });

  return router;
}

export function createMessagesRouter(container: AppContainer): Hono {
  const router = new Hono();

  router.get('/:eventId/threads', async (c) => {
    const threads = await container.messages.listThreads(c.req.param('eventId') as never);
    return c.json(threads, 200);
  });

  router.get('/:eventId/threads/:threadId', async (c) => {
    const messages = await container.messages.listMessages(
      c.req.param('eventId') as never,
      c.req.param('threadId'),
    );
    return c.json(messages, 200);
  });

  router.post('/:eventId/threads/:threadId', async (c) => {
    const body = await c.req.json<{ body?: string; senderName?: string; senderId?: string }>().catch(() => null);

    if (!body?.body?.trim()) {
      return c.json({ error: 'body is required', code: 'INVALID_REQUEST' }, 400);
    }

    try {
      const message = await container.messages.sendMessage({
        eventId: c.req.param('eventId') as never,
        threadId: c.req.param('threadId'),
        senderId: body.senderId ?? 'user-1',
        senderName: body.senderName ?? 'Alessia Rossi',
        body: body.body.trim(),
        isSystem: false,
      });
      return c.json(message, 201);
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
