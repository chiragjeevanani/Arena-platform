import { apiJson } from './apiClient';

export function fetchCourtAvailability(courtId, dateYmd) {
  const q = new URLSearchParams({ date: dateYmd });
  return apiJson(`/api/public/courts/${encodeURIComponent(courtId)}/availability?${q}`, {
    method: 'GET',
    skipAuth: true,
  });
}

/**
 * Creates a court booking. Omit `amount` so the server applies membership + arena hourly pricing.
 */
export function createMyBooking({ arenaId, courtId, date, timeSlot, amount, paymentMethod }) {
  const body = {
    arenaId,
    courtId,
    date,
    timeSlot,
    ...(amount !== undefined && amount !== null ? { amount } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
  };
  return apiJson('/api/me/bookings', { method: 'POST', body });
}

export function listMyBookings() {
  return apiJson('/api/me/bookings', { method: 'GET' });
}

export function cancelMyBooking(bookingId) {
  return apiJson(`/api/me/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'PATCH' });
}
