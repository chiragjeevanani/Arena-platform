import { createPaymentIntent, confirmMockPayment, getMyWallet } from './meApi';
import { redirectToCcavenue } from './ccavenueRedirect';

/**
 * Wallet credit flow: creates a payment intent. Redirects to CCAvenue if provider is 'ccavenue',
 * otherwise confirms via mock gateway (matches backend Phase 9).
 * 
 * @param {number} amount
 * @param {string} webhookSecret - must match backend MOCK_PAYMENT_WEBHOOK_SECRET
 * @returns {Promise<{ wallet: object, transactions: unknown[] }>}
 */
export async function completeWalletTopUpViaMockPayment(amount, webhookSecret) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const intent = await createPaymentIntent({ purpose: 'top_up', amount: n });

  if (intent?.provider === 'ccavenue') {
    redirectToCcavenue({
      paymentUrl: intent.paymentUrl,
      encRequest: intent.encRequest,
      accessCode: intent.accessCode,
    });
    // Return a pending promise to keep the loading UI active during redirection
    return new Promise(() => {});
  }

  const paymentId = intent?.payment?.id;
  if (!paymentId) {
    throw new Error('No payment id from intent response');
  }

  const secret = (webhookSecret || '').trim();
  if (!secret) {
    throw new Error('Mock payment webhook secret is not configured');
  }

  await confirmMockPayment(paymentId, secret);
  return getMyWallet();
}

