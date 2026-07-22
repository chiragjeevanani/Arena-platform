import { apiJson } from './apiClient';

/**
 * Create a Bank Muscat SmartPay payment (server builds encrypted request).
 * Amount for bookings is taken from MongoDB — do not rely on client amount.
 */
export function createBankMuscatPayment({ purpose, bookingId, amount } = {}) {
  return apiJson('/api/payments/bank-muscat/create', {
    method: 'POST',
    body: {
      purpose,
      ...(bookingId ? { bookingId } : {}),
      ...(amount != null ? { amount } : {}),
    },
  });
}

/** Backend-verified payment status only. */
export function getBankMuscatPaymentStatus(paymentId) {
  return apiJson(`/api/payments/bank-muscat/status/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
  });
}

export function isBankMuscatRedirectProvider(provider) {
  return provider === 'bank_muscat' || provider === 'ccavenue';
}
