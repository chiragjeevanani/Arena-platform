import { apiJson } from './apiClient';

/**
 * @param {{ arenaId?: string, date?: string }} [query]
 */
export function listAdminBookings(query = {}) {
  const q = new URLSearchParams();
  if (query.arenaId) q.set('arenaId', query.arenaId);
  if (query.date) q.set('date', query.date);
  const qs = q.toString();
  return apiJson(`/api/admin/bookings${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

/** Full refund of a paid booking. method: 'wallet' (credit Arena Wallet) | 'bank' (record a Bank Muscat portal refund). */
export function refundAdminBooking(bookingId, { method = 'wallet', reference = '' } = {}) {
  return apiJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}/refund`, {
    method: 'POST',
    body: { method, reference },
  });
}

/** Captured gateway payments whose booking couldn't be confirmed and still need a refund. */
export function listManualRefunds() {
  return apiJson('/api/admin/refunds', { method: 'GET' });
}

export function updateAdminBooking(bookingId, body) {
  return apiJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PATCH',
    body,
  });
}
