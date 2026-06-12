import { apiJson } from './apiClient';

/**
 * Tell backend to create a Razorpay order and a pending Payment record.
 * @param {object} opts
 * @param {string} opts.purpose  - 'top_up' | 'membership' | 'booking' | 'enrollment'
 * @param {number} opts.amount   - amount in OMR
 * @param {object} [opts.meta]   - optional { planId, bookingId, batchId }
 * @returns {{ orderId, amount, currency, paymentRecordId, razorpayKeyId, originalAmount }}
 */
export function createRazorpayOrder({ purpose, amount, meta = {} }) {
  return apiJson('/api/me/payments/razorpay/create-order', {
    method: 'POST',
    body: { purpose, amount, ...meta },
  });
}

/**
 * Send Razorpay callback values to backend for HMAC signature verification.
 * On success the backend credits wallet (for top_up) or marks payment succeeded.
 * @param {object} opts
 * @param {string} opts.razorpay_payment_id
 * @param {string} opts.razorpay_order_id
 * @param {string} opts.razorpay_signature
 * @param {string} opts.paymentRecordId - MongoDB _id returned by createRazorpayOrder
 */
export function verifyRazorpayPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentRecordId }) {
  return apiJson('/api/me/payments/razorpay/verify', {
    method: 'POST',
    body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentRecordId },
  });
}
