import { apiJson, apiMultipart } from './apiClient';

const BASE = '/api/admin';

/**
 * @param {{ arenaId: string }} query
 */
export function listAdminInventoryItems(query) {
  if (!query?.arenaId) {
    return Promise.reject(new Error('arenaId is required'));
  }
  return apiJson(`${BASE}/inventory?arenaId=${encodeURIComponent(query.arenaId)}`, { method: 'GET' });
}

export function createAdminInventoryItem(body) {
  return apiJson(`${BASE}/inventory`, { method: 'POST', body });
}

export function updateAdminInventoryItem(itemId, body) {
  return apiJson(`${BASE}/inventory/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteAdminInventoryItem(itemId) {
  return apiJson(`${BASE}/inventory/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
}

export function createAdminPosSale(body) {
  return apiJson(`${BASE}/pos/sales`, { method: 'POST', body });
}

export function listAdminPosSales(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/pos/sales?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function getAdminPosSaleById(saleId) {
  if (!saleId) return Promise.reject(new Error('saleId is required'));
  return apiJson(`${BASE}/pos/sales/${encodeURIComponent(saleId)}`, { method: 'GET' });
}

export function createAdminCmsContent(body) {
  return apiJson(`${BASE}/cms`, { method: 'POST', body });
}

/**
 * @param {{ arenaId?: string, kind?: string }} query
 */
export function listAdminCmsContent(query = {}) {
  const q = new URLSearchParams();
  if (query.arenaId) q.set('arenaId', query.arenaId);
  if (query.kind) q.set('kind', query.kind);
  const qs = q.toString();
  return apiJson(`${BASE}/cms${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function updateAdminCmsContent(contentId, body) {
  return apiJson(`${BASE}/cms/${encodeURIComponent(contentId)}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteAdminCmsContent(contentId) {
  return apiJson(`${BASE}/cms/${encodeURIComponent(contentId)}`, { method: 'DELETE' });
}

export function listAdminMembershipPlans(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/membership-plans?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function getAdminMembershipStats(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/membership-plans/stats?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function createAdminMembershipPlan(body) {
  return apiJson(`${BASE}/membership-plans`, { method: 'POST', body });
}

export function patchAdminMembershipPlan(planId, body) {
  return apiJson(`${BASE}/membership-plans/${encodeURIComponent(planId)}`, { method: 'PATCH', body });
}

export function deleteAdminMembershipPlan(planId) {
  return apiJson(`${BASE}/membership-plans/${encodeURIComponent(planId)}`, { method: 'DELETE' });
}

/**
 * @param {{ arenaId?: string, status?: string }} query
 */
export function listAdminUserMemberships(query = {}) {
  const q = new URLSearchParams();
  if (query.arenaId) q.set('arenaId', query.arenaId);
  if (query.status) q.set('status', query.status);
  const qs = q.toString();
  return apiJson(`${BASE}/memberships${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function createAdminArena(body) {
  return apiJson(`${BASE}/arenas`, { method: 'POST', body });
}

export function patchAdminArena(arenaId, body) {
  return apiJson(`${BASE}/arenas/${encodeURIComponent(arenaId)}`, { method: 'PATCH', body });
}

export function deleteAdminArena(arenaId) {
  return apiJson(`${BASE}/arenas/${encodeURIComponent(arenaId)}`, { method: 'DELETE' });
}

export function createAdminCourt(arenaId, body) {
  return apiJson(`${BASE}/arenas/${encodeURIComponent(arenaId)}/courts`, { method: 'POST', body });
}

export function deleteAdminCourt(courtId) {
  return apiJson(`${BASE}/courts/${encodeURIComponent(courtId)}`, { method: 'DELETE' });
}

export function updateAdminCourt(courtId, body) {
  return apiJson(`${BASE}/courts/${encodeURIComponent(courtId)}`, { method: 'PATCH', body });
}

export function listAdminCoachingBatches(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/coaching-batches?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function createAdminCoachingBatch(body) {
  return apiJson(`${BASE}/coaching-batches`, { method: 'POST', body });
}

export function updateAdminCoachingBatch(batchId, body) {
  return apiJson(`${BASE}/coaching-batches/${encodeURIComponent(batchId)}`, { method: 'PATCH', body });
}

export function deleteAdminCoachingBatch(batchId) {
  return apiJson(`${BASE}/coaching-batches/${encodeURIComponent(batchId)}`, { method: 'DELETE' });
}

export function listEventRegistrations(eventId) {
  const q = new URLSearchParams();
  if (eventId) q.set('eventId', eventId);
  return apiJson(`${BASE}/events/registrations${q.toString() ? `?${q.toString()}` : ''}`, { method: 'GET' });
}

export function updateEventRegistrationStatus(id, status) {
  return apiJson(`${BASE}/events/registrations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status }
  });
}

export function listAdminArenas() {
  return apiJson(`${BASE}/arenas`, { method: 'GET' });
}

export function getAdminArenaById(arenaId) {
  return apiJson(`${BASE}/arenas/${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function listAdminArenaBlocks(arenaId, date) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  const q = new URLSearchParams();
  if (date) q.set('date', date);
  const qs = q.toString();
  return apiJson(`${BASE}/arenas/${encodeURIComponent(arenaId)}/blocks${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function uploadAdminImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiMultipart(`${BASE}/upload/image`, formData);
}

export function listAdminUsers(query = {}) {
  const q = new URLSearchParams();
  if (query.role) q.set('role', query.role);
  if (query.q) q.set('q', query.q);
  const qs = q.toString();
  return apiJson(`${BASE}/users${qs ? `?${qs}` : ''}`, { method: 'GET' });
}


