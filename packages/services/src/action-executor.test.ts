import type { WorkflowAction } from '@edit-os/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { ActionExecutor } from './action-executor.js';
import { createComoVillaGalaEvent } from './fixtures/como-villa-gala.js';
import { InMemoryMessageRepository } from './messaging.repository.js';

describe('ActionExecutor', () => {
  let messages: InMemoryMessageRepository;
  let executor: ActionExecutor;
  const event = createComoVillaGalaEvent();

  beforeEach(() => {
    messages = new InMemoryMessageRepository();
    executor = new ActionExecutor({ messages });
  });

  it('sends vendor notifications to mapped threads', async () => {
    const actions: WorkflowAction[] = [
      {
        type: 'notify_vendor',
        target: 'catering',
        detail: 'Activar Plan B.',
      },
    ];

    const records = await executor.execute(event, actions);
    const threadMessages = await messages.listMessages(event.id, 'thread-catering');

    expect(records).toHaveLength(1);
    expect(records[0]?.status).toBe('completed');
    expect(threadMessages.some((m) => m.body.includes('Activar Plan B'))).toBe(true);
  });

  it('dispatches staff alerts to thread-staff', async () => {
    const actions: WorkflowAction[] = [
      {
        type: 'alert_staff',
        target: 'kitchen',
        detail: 'Activar suplente de reserva.',
      },
    ];

    const records = await executor.execute(event, actions);
    const staffMessages = await messages.listMessages(event.id, 'thread-staff');

    expect(records[0]?.status).toBe('completed');
    expect(staffMessages.some((m) => m.body.includes('kitchen'))).toBe(true);
  });

  it('records shift_timeline without sending messages', async () => {
    const actions: WorkflowAction[] = [
      {
        type: 'shift_timeline',
        target: 'cóctel',
        detail: 'Retrasar inicio del cóctel +30 min.',
      },
    ];

    const before = (await messages.listThreads(event.id)).length;
    const records = await executor.execute(event, actions);
    const after = (await messages.listThreads(event.id)).length;

    expect(records[0]?.outcome).toContain('+30 min');
    expect(after).toBe(before);
  });
});
