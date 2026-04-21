import { apiJson } from './apiClient';

const BASE = '/api/arena-admin';

/**
 * @param {{ arenaId: string, date?: string }} query
 */
export function listArenaAdminBookings(query) {
  if (!query?.arenaId) {
    return Promise.reject(new Error('arenaId is required'));
  }
  const q = new URLSearchParams();
  q.set('arenaId', query.arenaId);
  if (query.date) q.set('date', query.date);
  return apiJson(`${BASE}/bookings?${q.toString()}`, { method: 'GET' });
}

export function updateArenaAdminBooking(bookingId, body) {
  return apiJson(`${BASE}/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PATCH',
    body,
  });
}

export function createArenaAdminMembershipPlan(body) {
  return apiJson(`${BASE}/membership-plans`, { method: 'POST', body });
}

/**
 * @param {string} arenaId
 */
export function listArenaAdminMembershipPlans(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/membership-plans?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function createArenaAdminCoachingBatch(body) {
  return apiJson(`${BASE}/coaching-batches`, { method: 'POST', body });
}

export function listArenaAdminCoachingBatches(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/coaching-batches?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function updateArenaAdminCoachingBatch(batchId, body) {
  return apiJson(`${BASE}/coaching-batches/${encodeURIComponent(batchId)}`, {
    method: 'PATCH',
    body,
  });
}

export function createArenaAdminInventoryItem(body) {
  return apiJson(`${BASE}/inventory`, { method: 'POST', body });
}

export function listArenaAdminInventoryItems(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/inventory?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function updateArenaAdminInventoryItem(itemId, body) {
  return apiJson(`${BASE}/inventory/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body,
  });
}

export function createArenaAdminPosSale(body) {
  return apiJson(`${BASE}/pos/sales`, { method: 'POST', body });
}

export function listArenaAdminPosSales(arenaId) {
  if (!arenaId) return Promise.reject(new Error('arenaId is required'));
  return apiJson(`${BASE}/pos/sales?arenaId=${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function createArenaAdminCmsContent(body) {
  return apiJson(`${BASE}/cms`, { method: 'POST', body });
}

/**
 * @param {{ arenaId: string, kind?: string }} query
 */
export function listArenaAdminCmsContent(query) {
  if (!query?.arenaId) return Promise.reject(new Error('arenaId is required'));
  const q = new URLSearchParams();
  q.set('arenaId', query.arenaId);
  if (query.kind) q.set('kind', query.kind);
  return apiJson(`${BASE}/cms?${q.toString()}`, { method: 'GET' });
}

export function updateArenaAdminCmsContent(contentId, body) {
  return apiJson(`${BASE}/cms/${encodeURIComponent(contentId)}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteArenaAdminCmsContent(contentId) {
  return apiJson(`${BASE}/cms/${encodeURIComponent(contentId)}`, { method: 'DELETE' });
}
