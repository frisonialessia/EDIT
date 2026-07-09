import type { Event, Message, MessageThread, ProfileState, DocumentTreeNode } from '@edit-os/core';
import { demoStore } from './demo-store';

/** Sin VITE_API_URL usamos demo embebido — Vercel funciona sin backend. */
const USE_DEMO = !import.meta.env.VITE_API_URL;
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

async function withDemoFallback<T>(fetcher: () => Promise<T>, fallback: () => T): Promise<T> {
  if (USE_DEMO) {
    return fallback();
  }

  try {
    return await fetcher();
  } catch {
    return fallback();
  }
}

export async function fetchEvent(eventId: string): Promise<Event> {
  return withDemoFallback(
    async () => parseResponse<Event>(await fetch(`${API_BASE}/events/${eventId}`)),
    () => demoStore.getEvent(),
  );
}

export async function assignVendorToEvent(
  eventId: string,
  vendorId: string,
): Promise<Event> {
  return withDemoFallback(
    async () =>
      parseResponse<Event>(
        await fetch(`${API_BASE}/events/${eventId}/assign-vendor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId }),
        }),
      ),
    () => demoStore.getEvent(),
  );
}

export async function evaluateEvent(eventId: string): Promise<Event> {
  return withDemoFallback(
    async () =>
      parseResponse<Event>(
        await fetch(`${API_BASE}/events/${eventId}/evaluate`, { method: 'POST' }),
      ),
    () => demoStore.evaluateEvent(),
  );
}

export async function approveProposal(eventId: string, proposalId: string): Promise<Event> {
  return withDemoFallback(
    async () =>
      parseResponse<Event>(
        await fetch(`${API_BASE}/events/${eventId}/proposals/${proposalId}/approve`, {
          method: 'POST',
        }),
      ),
    () => demoStore.approveProposal(proposalId),
  );
}

export async function rejectProposal(eventId: string, proposalId: string): Promise<Event> {
  return withDemoFallback(
    async () =>
      parseResponse<Event>(
        await fetch(`${API_BASE}/events/${eventId}/proposals/${proposalId}/reject`, {
          method: 'POST',
        }),
      ),
    () => demoStore.rejectProposal(proposalId),
  );
}

export async function fetchProfile(): Promise<ProfileState> {
  return withDemoFallback(
    async () => parseResponse<ProfileState>(await fetch(`${API_BASE}/profile`)),
    () => demoStore.getProfile(),
  );
}

export async function updateProfile(partial: Partial<ProfileState>): Promise<ProfileState> {
  return withDemoFallback(
    async () =>
      parseResponse<ProfileState>(
        await fetch(`${API_BASE}/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial),
        }),
      ),
    () => demoStore.updateProfile(partial),
  );
}

export async function fetchMessageThreads(eventId: string): Promise<MessageThread[]> {
  return withDemoFallback(
    async () => parseResponse<MessageThread[]>(await fetch(`${API_BASE}/messages/${eventId}/threads`)),
    () => demoStore.getThreads(),
  );
}

export async function fetchThreadMessages(
  eventId: string,
  threadId: string,
): Promise<Message[]> {
  return withDemoFallback(
    async () =>
      parseResponse<Message[]>(
        await fetch(`${API_BASE}/messages/${eventId}/threads/${threadId}`),
      ),
    () => demoStore.getMessages(threadId),
  );
}

export async function sendMessage(
  eventId: string,
  threadId: string,
  body: string,
): Promise<Message> {
  return withDemoFallback(
    async () =>
      parseResponse<Message>(
        await fetch(`${API_BASE}/messages/${eventId}/threads/${threadId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        }),
      ),
    () => demoStore.sendMessage(threadId, body),
  );
}

export async function fetchDocumentTree(eventId: string): Promise<DocumentTreeNode[]> {
  return withDemoFallback(
    async () => parseResponse<DocumentTreeNode[]>(await fetch(`${API_BASE}/documents/${eventId}/tree`)),
    () => demoStore.getDocumentTree(),
  );
}
