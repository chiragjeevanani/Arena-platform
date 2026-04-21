import { apiJson } from './apiClient';

export function getMyWallet() {
  return apiJson('/api/me/wallet', { method: 'GET' });
}

export function topUpMyWallet(amount) {
  return apiJson('/api/me/wallet/top-up', { method: 'POST', body: { amount } });
}

export function listMyMemberships() {
  return apiJson('/api/me/memberships', { method: 'GET' });
}

export function purchaseMembership(planId) {
  return apiJson('/api/me/memberships/purchase', { method: 'POST', body: { planId } });
}

export function listMyEnrollments() {
  return apiJson('/api/me/enrollments', { method: 'GET' });
}

export function createMyEnrollment(batchId) {
  return apiJson('/api/me/enrollments', { method: 'POST', body: { batchId } });
}

export function cancelMyEnrollment(id) {
  return apiJson(`/api/me/enrollments/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
}

export function createPaymentIntent({ purpose, amount }) {
  return apiJson('/api/me/payments/intent', { method: 'POST', body: { purpose, amount } });
}

export function listMyPayments() {
  return apiJson('/api/me/payments', { method: 'GET' });
}

export function patchMyProfile(body) {
  return apiJson('/api/me/profile', { method: 'PATCH', body });
}

export function listMyAttendance(params = {}) {
  const q = new URLSearchParams();
  if (params.month) q.set('month', params.month);
  const qs = q.toString();
  return apiJson(`/api/me/attendance${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

/**
 * Confirm mock payment (credits wallet for top_up). Requires backend MOCK_PAYMENT_WEBHOOK_SECRET.
 */
export function confirmMockPayment(paymentId, secret) {
  return apiJson('/api/webhooks/payments/mock', {
    method: 'POST',
    body: { paymentId },
    skipAuth: true,
    headers: { 'X-Mock-Payment-Secret': secret },
  });
}
export function listMyEventRegistrations() {
  return apiJson('/api/me/event-registrations', { method: 'GET' });
}
