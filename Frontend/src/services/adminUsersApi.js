import { apiJson } from './apiClient';

export function listAdminUsers(params = {}) {
  const q = new URLSearchParams();
  if (params.role) q.set('role', params.role);
  if (params.q) q.set('q', params.q);
  if (params.skip != null) q.set('skip', String(params.skip));
  if (params.limit != null) q.set('limit', String(params.limit));
  const qs = q.toString();
  return apiJson(`/api/admin/users${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function patchAdminUser(userId, body) {
  return apiJson(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body,
  });
}

export function createAdminUser(body) {
  return apiJson('/api/admin/users', {
    method: 'POST',
    body,
  });
}
