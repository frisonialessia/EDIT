import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAppContainer } from './lib/container.js';
import { respondWithDomainError } from './lib/http-errors.js';
import { createEventsRouter } from './routes/events.js';
import { createMessagesRouter, createProfileRouter } from './routes/profile.js';

const PORT = Number(process.env['PORT'] ?? 3000);

async function main(): Promise<void> {
  const container = await createAppContainer();
  const app = new Hono();

  app.use('/*', cors());

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.route('/events', createEventsRouter(container));
  app.route('/profile', createProfileRouter(container));
  app.route('/messages', createMessagesRouter(container));

  app.onError((error, c) => {
    const response = respondWithDomainError(c, error);
    if (response) {
      return response;
    }

    console.error(error);
    return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
  });

  serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`EDIT-OS API listening on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
