import { apiJson } from './apiClient';

const BASE = '/api/admin';
const ME = '/api/me';

// ─── Admin: Slot Free Config ──────────────────────────────────────────────────

export function getSlotFreeConfig(arenaId) {
  return apiJson(`${BASE}/slot-free-config/${encodeURIComponent(arenaId)}`, { method: 'GET' });
}

export function updateSlotFreeConfig(arenaId, body) {
  return apiJson(`${BASE}/slot-free-config/${encodeURIComponent(arenaId)}`, { method: 'PUT', body });
}

// ─── Admin: Points Discount Config ───────────────────────────────────────────

export function getPointsDiscountConfig() {
  return apiJson(`${BASE}/points-discount-config`, { method: 'GET' });
}

export function updatePointsDiscountConfig(body) {
  return apiJson(`${BASE}/points-discount-config`, { method: 'PUT', body });
}

// ─── Admin: Freed Slots ───────────────────────────────────────────────────────

export function listAdminFreedSlots(query = {}) {
  const q = new URLSearchParams();
  if (query.arenaId) q.set('arenaId', query.arenaId);
  if (query.status) q.set('status', query.status);
  if (query.startDate) q.set('startDate', query.startDate);
  if (query.endDate) q.set('endDate', query.endDate);
  if (query.page) q.set('page', query.page);
  if (query.limit) q.set('limit', query.limit);
  const qs = q.toString();
  return apiJson(`${BASE}/freed-slots${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function markFreedSlotResold(id) {
  return apiJson(`${BASE}/freed-slots/${encodeURIComponent(id)}/resold`, { method: 'PATCH' });
}

// ─── Admin: Points Wallets ────────────────────────────────────────────────────

export function listAdminPointsWallets(query = {}) {
  const q = new URLSearchParams();
  if (query.page) q.set('page', query.page);
  if (query.limit) q.set('limit', query.limit);
  const qs = q.toString();
  return apiJson(`${BASE}/points-wallets${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function adjustAdminPointsBalance(body) {
  return apiJson(`${BASE}/points-wallets/adjust`, { method: 'POST', body });
}

// ─── Admin: Slot Memberships ──────────────────────────────────────────────────

export function listAdminSlotMemberships(query = {}) {
  const q = new URLSearchParams();
  if (query.arenaId) q.set('arenaId', query.arenaId);
  if (query.status) q.set('status', query.status);
  if (query.page) q.set('page', query.page);
  if (query.limit) q.set('limit', query.limit);
  const qs = q.toString();
  return apiJson(`${BASE}/slot-memberships${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

// ─── User: Slot Memberships ───────────────────────────────────────────────────

export function getMySlotMemberships() {
  return apiJson(`${ME}/slot-memberships`, { method: 'GET' });
}

export function checkSlotAvailability(body) {
  return apiJson(`${ME}/slot-memberships/check-availability`, { method: 'POST', body });
}

export function previewSlotMembershipPricing(body) {
  return apiJson(`${ME}/slot-memberships/preview-pricing`, { method: 'POST', body });
}

export function freeMySlot(membershipId, body) {
  return apiJson(`${ME}/slot-memberships/${encodeURIComponent(membershipId)}/free-slot`, {
    method: 'POST',
    body,
  });
}

// ─── User: Points Wallet ──────────────────────────────────────────────────────

export function getMyPointsWallet() {
  return apiJson(`${ME}/points-wallet`, { method: 'GET' });
}

export function getMyPointsTransactions(query = {}) {
  const q = new URLSearchParams();
  if (query.page) q.set('page', query.page);
  if (query.limit) q.set('limit', query.limit);
  const qs = q.toString();
  return apiJson(`${ME}/points-transactions${qs ? `?${qs}` : ''}`, { method: 'GET' });
}
