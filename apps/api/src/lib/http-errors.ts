import type { EventId, VendorId, WorkflowProposalId } from '@edit-os/core';
import {
  EventNotFoundError,
  InvalidEventStatusError,
  VendorAlreadyAssignedError,
  VendorNotFoundError,
  WorkflowProposalNotFoundError,
} from '@edit-os/services';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

interface DomainErrorResponse {
  readonly error: string;
  readonly code: string;
}

export function mapDomainErrorToHttp(error: unknown): {
  status: ContentfulStatusCode;
  body: DomainErrorResponse;
} | null {
  if (error instanceof EventNotFoundError) {
    return {
      status: 404,
      body: { error: error.message, code: 'EVENT_NOT_FOUND' },
    };
  }

  if (error instanceof VendorNotFoundError) {
    return {
      status: 404,
      body: { error: error.message, code: 'VENDOR_NOT_FOUND' },
    };
  }

  if (error instanceof InvalidEventStatusError) {
    return {
      status: 400,
      body: { error: error.message, code: 'INVALID_EVENT_STATUS' },
    };
  }

  if (error instanceof VendorAlreadyAssignedError) {
    return {
      status: 400,
      body: { error: error.message, code: 'VENDOR_ALREADY_ASSIGNED' },
    };
  }

  if (error instanceof WorkflowProposalNotFoundError) {
    return {
      status: 404,
      body: { error: error.message, code: 'PROPOSAL_NOT_FOUND' },
    };
  }

  return null;
}

export function respondWithDomainError(c: Context, error: unknown): Response | null {
  const mapped = mapDomainErrorToHttp(error);
  if (!mapped) {
    return null;
  }

  return c.json(mapped.body, mapped.status);
}

export function asEventId(value: string): EventId {
  return value as EventId;
}

export function asVendorId(value: string): VendorId {
  return value as VendorId;
}

export function asProposalId(value: string): WorkflowProposalId {
  return value as WorkflowProposalId;
}
