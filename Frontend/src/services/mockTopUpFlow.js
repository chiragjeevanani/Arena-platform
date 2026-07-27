import { createBankMuscatPayment, isBankMuscatRedirectProvider } from './bankMuscatApi';
import { createPaymentIntent, confirmMockPayment, getMyWallet } from './meApi';
import { redirectToBankMuscat } from './ccavenueRedirect';

/**
 * Wallet credit flow via Bank Muscat SmartPay (or mock fallback).
 * Success is never assumed on the client — redirect return page verifies via backend status API.
 */
export async function completeWalletTopUpViaMockPayment(amount, webhookSecret) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('Amount must be a positive number');
  }

  let intent;
  try {
    intent = await createBankMuscatPayment({ purpose: 'top_up', amount: n });
  } catch (err) {
    // 503 = SmartPay not configured → fall back to legacy intent (mock)
    if (err.status === 503 || err.status === 501) {
      intent = await createPaymentIntent({ purpose: 'top_up', amount: n });
    } else {
      throw err;
    }
  }

  if (isBankMuscatRedirectProvider(intent?.provider)) {
    const { saveBankMuscatCheckoutContext } = await import('./bankMuscatCheckoutContext');
    saveBankMuscatCheckoutContext({
      type: 'wallet_top_up',
      paymentPurpose: 'top_up',
      amount: n,
    });
    redirectToBankMuscat({
      paymentUrl: intent.paymentUrl,
      encRequest: intent.encRequest,
      accessCode: intent.accessCode,
    });
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
