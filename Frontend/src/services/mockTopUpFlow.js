import { createPaymentIntent, confirmMockPayment, getMyWallet } from './meApi';

/**
 * Wallet credit via mock gateway: payment intent + webhook confirmation (matches backend Phase 9).
 * @param {number} amount
 * @param {string} webhookSecret - must match backend MOCK_PAYMENT_WEBHOOK_SECRET
 * @returns {Promise<{ wallet: object, transactions: unknown[] }>}
 */
export async function completeWalletTopUpViaMockPayment(amount, webhookSecret) {
  const secret = (webhookSecret || '').trim();
  if (!secret) {
    throw new Error('Mock payment webhook secret is not configured');
  }

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const intent = await createPaymentIntent({ purpose: 'top_up', amount: n });
  const paymentId = intent?.payment?.id;
  if (!paymentId) {
    throw new Error('No payment id from intent response');
  }

  await confirmMockPayment(paymentId, secret);
  return getMyWallet();
}
