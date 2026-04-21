import { apiJson } from './apiClient';

export function fetchPublicCoachingBatches(arenaId) {
  return apiJson(`/api/public/arenas/${encodeURIComponent(arenaId)}/coaching-batches`, {
    method: 'GET',
    skipAuth: true,
  });
}
