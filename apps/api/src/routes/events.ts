import { Hono } from 'hono';
import type { PolicyThresholds } from '@edit-os/core';
import type { AppContainer } from '../lib/container.js';
import {
  asEventId,
  asProposalId,
  asVendorId,
  respondWithDomainError,
} from '../lib/http-errors.js';

interface AssignVendorBody {
  vendorId?: string;
}

interface PatchPolicyBody {
  thresholds?: Partial<PolicyThresholds>;
}

export function createEventsRouter(container: AppContainer): Hono {
  const router = new Hono();

  router.get('/:eventId', async (c) => {
    const event = await container.events.findById(asEventId(c.req.param('eventId')));

    if (!event) {
      return c.json(
        { error: `Event not found: ${c.req.param('eventId')}`, code: 'EVENT_NOT_FOUND' },
        404,
      );
    }

    return c.json(event, 200);
  });

  router.post('/:eventId/assign-vendor', async (c) => {
    const body = await c.req.json<AssignVendorBody>().catch(() => null);

    if (!body?.vendorId) {
      return c.json(
        { error: 'vendorId is required', code: 'INVALID_REQUEST' },
        400,
      );
    }

    try {
      const event = await container.orchestrator.assignVendorToEvent(
        asEventId(c.req.param('eventId')),
        asVendorId(body.vendorId),
      );

      return c.json(event, 200);
    } catch (error) {
      const response = respondWithDomainError(c, error);
      if (response) {
        return response;
      }

      throw error;
    }
  });

  router.post('/:eventId/evaluate', async (c) => {
    try {
      const event = await container.domino.evaluateEvent(asEventId(c.req.param('eventId')));
      return c.json(event, 200);
    } catch (error) {
      const response = respondWithDomainError(c, error);
      if (response) {
        return response;
      }

      throw error;
    }
  });

  router.post('/:eventId/proposals/:proposalId/approve', async (c) => {
    try {
      const event = await container.domino.approveProposal(
        asEventId(c.req.param('eventId')),
        asProposalId(c.req.param('proposalId')),
      );
      return c.json(event, 200);
    } catch (error) {
      const response = respondWithDomainError(c, error);
      if (response) {
        return response;
      }

      throw error;
    }
  });

  router.post('/:eventId/proposals/:proposalId/reject', async (c) => {
    try {
      const event = await container.domino.rejectProposal(
        asEventId(c.req.param('eventId')),
        asProposalId(c.req.param('proposalId')),
      );
      return c.json(event, 200);
    } catch (error) {
      const response = respondWithDomainError(c, error);
      if (response) {
        return response;
      }

      throw error;
    }
  });

  router.get('/:eventId/policies', async (c) => {
    const eventId = asEventId(c.req.param('eventId'));
    const event = await container.events.findById(eventId);

    if (!event) {
      return c.json(
        { error: `Event not found: ${c.req.param('eventId')}`, code: 'EVENT_NOT_FOUND' },
        404,
      );
    }

    const policy = container.policies.getPolicy();
    const logs = container.policies.getLogs(eventId);

    return c.json({ policy, logs, eventLogs: event.orchestrationLogs }, 200);
  });

  router.patch('/:eventId/policies', async (c) => {
    const eventId = asEventId(c.req.param('eventId'));
    const event = await container.events.findById(eventId);

    if (!event) {
      return c.json(
        { error: `Event not found: ${c.req.param('eventId')}`, code: 'EVENT_NOT_FOUND' },
        404,
      );
    }

    const body = await c.req.json<PatchPolicyBody>().catch(() => null);
    if (!body?.thresholds) {
      return c.json(
        { error: 'thresholds is required', code: 'INVALID_REQUEST' },
        400,
      );
    }

    const thresholds = container.policies.updateThresholds('default', body.thresholds);
    const policy = { ...container.policies.getPolicy(), thresholds };

    return c.json({ policy }, 200);
  });

  return router;
}
