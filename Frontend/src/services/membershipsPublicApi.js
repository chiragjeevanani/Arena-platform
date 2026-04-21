import { apiJson } from './apiClient';

export function fetchPublicMembershipPlans(arenaId) {
  return apiJson(`/api/public/arenas/${encodeURIComponent(arenaId)}/membership-plans`, {
    method: 'GET',
    skipAuth: true,
  });
}
