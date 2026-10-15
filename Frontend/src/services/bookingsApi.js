import { apiJson } from './apiClient';

export function fetchCourtAvailability(courtId, dateYmd) {
  const q = new URLSearchParams({ date: dateYmd });
  return apiJson(`/api/public/courts/${encodeURIComponent(courtId)}/availability?${q}`, {
    method: 'GET',
    skipAuth: true,
  });
}

export function fetchCourtSlots(courtId) {
  return apiJson(`/api/public/courts/${encodeURIComponent(courtId)}/slots`, {
    method: 'GET',
    skipAuth: true,
  });
}

export function fetchBookingPricing(arenaId, { courtId, date, timeSlot } = {}) {
  const body = { arenaId };
  if (courtId) body.courtId = courtId;
  if (date) body.date = date;
  if (timeSlot) body.timeSlot = timeSlot;
  return apiJson('/api/me/bookings/pricing', {
    method: 'POST',
    body,
  });
}

/**
 * Creates a court booking. Omit `amount` so the server applies membership + arena hourly pricing.
 */
export function createMyBooking({ arenaId, courtId, date, timeSlot, amount, paymentMethod, useWallet }) {
  const body = {
    arenaId,
    courtId,
    date,
    timeSlot,
    ...(amount !== undefined && amount !== null ? { amount } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(useWallet ? { useWallet: true } : {}),
  };
  return apiJson('/api/me/bookings', { method: 'POST', body });
}

export function listMyBookings() {
  return apiJson('/api/me/bookings', { method: 'GET' });
}

/** What cancelling now would refund: { cancellable, paid, eligible, refundAmount, policyHours }. */
export function getBookingCancelQuote(bookingId) {
  return apiJson(`/api/me/bookings/${encodeURIComponent(bookingId)}/cancel-quote`, { method: 'GET' });
}

export function cancelMyBooking(bookingId) {
  return apiJson(`/api/me/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'PATCH' });
}

/**
 * Exact server price for an order (member discount + coupon), no side effects.
 * lines: [{ arenaId, courtId, date: 'YYYY-MM-DD', timeSlot }]
 */
export function quoteCheckout({ lines, couponCode }) {
  return apiJson('/api/me/bookings/checkout/quote', { method: 'POST', body: { lines, couponCode: couponCode || undefined } });
}

/** Books all lines in one go (all-or-nothing). Returns { checkoutId, bookings, summary: { ..., due } }. */
export function checkoutBookings({ lines, couponCode, useWallet }) {
  return apiJson('/api/me/bookings/checkout', { method: 'POST', body: { lines, couponCode: couponCode || undefined, useWallet: Boolean(useWallet) } });
}
