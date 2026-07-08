import type { Event, Message, MessageThread, ProfileState } from '@edit-os/core';

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

export async function evaluateEvent(eventId: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/events/${eventId}/evaluate`, {
    method: 'POST',
  });

  return parseResponse<Event>(response);
}

export async function approveProposal(eventId: string, proposalId: string): Promise<Event> {
  const response = await fetch(
    `${API_BASE}/events/${eventId}/proposals/${proposalId}/approve`,
    { method: 'POST' },
  );

  return parseResponse<Event>(response);
}

export async function rejectProposal(eventId: string, proposalId: string): Promise<Event> {
  const response = await fetch(
    `${API_BASE}/events/${eventId}/proposals/${proposalId}/reject`,
    { method: 'POST' },
  );

  return parseResponse<Event>(response);
}

export async function fetchProfile(): Promise<ProfileState> {
  const response = await fetch(`${API_BASE}/profile`);
  return parseResponse<ProfileState>(response);
}

export async function updateProfile(partial: Partial<ProfileState>): Promise<ProfileState> {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });

  return parseResponse<ProfileState>(response);
}

export async function fetchMessageThreads(eventId: string): Promise<MessageThread[]> {
  const response = await fetch(`${API_BASE}/messages/${eventId}/threads`);
  return parseResponse<MessageThread[]>(response);
}

export async function fetchThreadMessages(
  eventId: string,
  threadId: string,
): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/messages/${eventId}/threads/${threadId}`);
  return parseResponse<Message[]>(response);
}

export async function sendMessage(
  eventId: string,
  threadId: string,
  body: string,
): Promise<Message> {
  const response = await fetch(`${API_BASE}/messages/${eventId}/threads/${threadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  return parseResponse<Message>(response);
}
