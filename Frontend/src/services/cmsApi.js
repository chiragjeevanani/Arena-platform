import { apiJson, apiMultipart } from './apiClient';

export function fetchPublishedCms(kind, arenaId) {
  const q = new URLSearchParams({ kind });
  if (arenaId) q.set('arenaId', arenaId);
  return apiJson(`/api/public/cms?${q.toString()}`, { method: 'GET', skipAuth: true });
}

/** SUPER_ADMIN — list all CMS rows (published and drafts). */
export function listAdminCms(kind) {
  const q = new URLSearchParams();
  if (kind) q.set('kind', kind);
  const qs = q.toString();
  return apiJson(`/api/admin/cms${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function createAdminCms(payload) {
  return apiJson('/api/admin/cms', { method: 'POST', body: payload });
}

export function updateAdminCms(contentId, payload) {
  return apiJson(`/api/admin/cms/${encodeURIComponent(contentId)}`, { method: 'PATCH', body: payload });
}

export function deleteAdminCms(contentId) {
  return apiJson(`/api/admin/cms/${encodeURIComponent(contentId)}`, { method: 'DELETE' });
}

export function uploadAdminImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  return apiMultipart('/api/admin/upload/image', fd);
}
