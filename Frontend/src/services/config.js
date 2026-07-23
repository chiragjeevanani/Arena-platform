/** Base URL for Express API (no trailing slash). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function isApiConfigured() {
  return Boolean(API_BASE_URL);
}

/** Same value as backend MOCK_PAYMENT_WEBHOOK_SECRET; used only for dev mock checkout. */
export function getMockPaymentWebhookSecret() {
  return (import.meta.env.VITE_MOCK_PAYMENT_WEBHOOK_SECRET || '').trim();
}

/** `disabled` | `dev` — SMS OTP is not wired; `dev` uses POST /api/auth/verify-otp when backend has DEV_OTP_ENABLED. */
export function getOtpMode() {
  const m = (import.meta.env.VITE_OTP_MODE || 'disabled').toLowerCase();
  if (m === 'dev' || m === 'disabled') return m;
  return 'disabled';
}
