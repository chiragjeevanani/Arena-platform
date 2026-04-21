import { apiJson } from './apiClient';

export function listAdminSponsors(params = {}) {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  const qs = q.toString();
  return apiJson(`/api/admin/sponsors${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function createAdminSponsor(body) {
  return apiJson('/api/admin/sponsors', { method: 'POST', body });
}

export function patchAdminSponsor(id, body) {
  return apiJson(`/api/admin/sponsors/${encodeURIComponent(id)}`, { method: 'PATCH', body });
}

export function deleteAdminSponsor(id) {
  return apiJson(`/api/admin/sponsors/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
