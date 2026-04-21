import { apiJson } from './apiClient';

export function fetchPublicArenas() {
  return apiJson('/api/public/arenas', { method: 'GET', skipAuth: true });
}

export function fetchPublicArenaById(id) {
  return apiJson(`/api/public/arenas/${encodeURIComponent(id)}`, {
    method: 'GET',
    skipAuth: true,
  });
}
