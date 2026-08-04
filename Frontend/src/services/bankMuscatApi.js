import { apiJson } from './apiClient';

/**
 * Create a Bank Muscat SmartPay payment (server builds encrypted request).
 * Amount for court bookings is taken from MongoDB — do not rely on client amount.
 */
export function createBankMuscatPayment({
  purpose,
  bookingId,
  amount,
  planId,
  batchId,
  eventId,
  eventName,
  registrantName,
  registrantPhone,
} = {}) {
  return apiJson('/api/payments/bank-muscat/create', {
    method: 'POST',
    body: {
      purpose,
      ...(bookingId ? { bookingId } : {}),
      ...(amount != null ? { amount } : {}),
      ...(planId ? { planId } : {}),
      ...(batchId ? { batchId } : {}),
      ...(eventId ? { eventId } : {}),
      ...(eventName ? { eventName } : {}),
      ...(registrantName ? { registrantName } : {}),
      ...(registrantPhone ? { registrantPhone } : {}),
    },
  });
}

/** Backend-verified payment status only. */
export function getBankMuscatPaymentStatus(paymentId, hintStatus) {
  const q = hintStatus ? `?hintStatus=${encodeURIComponent(hintStatus)}` : '';
  return apiJson(`/api/payments/bank-muscat/status/${encodeURIComponent(paymentId)}${q}`, {
    method: 'GET',
  });
}

/** Second-leg Status/Inquiry API (orderStatusTracker) — syncs pending payments. */
export function inquireBankMuscatPayment(paymentId) {
  return apiJson(`/api/payments/bank-muscat/inquire/${encodeURIComponent(paymentId)}`, {
    method: 'POST',
  });
}

export function isBankMuscatRedirectProvider(provider) {
  return provider === 'bank_muscat' || provider === 'ccavenue';
}
