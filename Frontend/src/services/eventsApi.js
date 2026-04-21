import { apiJson } from './apiClient';

/**
 * Published CMS rows of kind `event` (global + optional arena merge when arenaId set).
 */
export function fetchPublishedEvents(arenaId) {
  const q = new URLSearchParams({ kind: 'event' });
  if (arenaId) q.set('arenaId', arenaId);
  return apiJson(`/api/public/cms?${q.toString()}`, { method: 'GET', skipAuth: true });
}

export function fetchPublishedEventById(id) {
  return apiJson(`/api/public/cms/${encodeURIComponent(id)}`, {
    method: 'GET',
    skipAuth: true,
  });
}

export function registerForEvent(payload) {
  return apiJson('/api/public/events/register', {
    method: 'POST',
    body: payload,
    skipAuth: true
  });
}
