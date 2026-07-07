import type { Event } from '@edit-os/core';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

interface ApiErrorBody {
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(body.error ?? 'Request failed', response.status, body.code);
  }

  return body as T;
}

export async function fetchEvent(eventId: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${eventId}`);
  return parseResponse<Event>(response);
}

export async function assignVendorToEvent(
  eventId: string,
  vendorId: string,
): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${eventId}/assign-vendor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorId }),
  });

  return parseResponse<Event>(response);
}
