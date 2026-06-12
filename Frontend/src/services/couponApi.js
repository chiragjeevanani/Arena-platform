import { apiJson } from './apiClient';

const ADMIN_BASE = '/api/admin/coupons';
const ME_BASE = '/api/me/coupons';

// ─── Admin API ───────────────────────────────────────────────────────────────

export function createAdminCoupon(body) {
  return apiJson(ADMIN_BASE, { method: 'POST', body });
}

export function listAdminCoupons() {
  return apiJson(ADMIN_BASE, { method: 'GET' });
}

export function updateAdminCoupon(couponId, body) {
  return apiJson(`${ADMIN_BASE}/${encodeURIComponent(couponId)}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteAdminCoupon(couponId) {
  return apiJson(`${ADMIN_BASE}/${encodeURIComponent(couponId)}`, {
    method: 'DELETE',
  });
}

// ─── User / Checkout API ─────────────────────────────────────────────────────

/** Returns all public active coupons for display in the checkout section. */
export function listPublicCoupons() {
  return apiJson(`${ME_BASE}/public`, { method: 'GET' });
}

/**
 * Preview the discount for a coupon code without consuming usage.
 * @param {{ code: string, orderAmount: number }} body
 */
export function validateCoupon(body) {
  return apiJson(`${ME_BASE}/validate`, { method: 'POST', body });
}
