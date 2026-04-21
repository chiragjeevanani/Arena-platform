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

export function updateAdminBooking(bookingId, body) {
  return apiJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PATCH',
    body,
  });
}
