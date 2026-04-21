import { describe, it, expect, vi, beforeEach } from 'vitest';

const createPaymentIntent = vi.hoisted(() => vi.fn());
const confirmMockPayment = vi.hoisted(() => vi.fn());
const getMyWallet = vi.hoisted(() => vi.fn());

vi.mock('../src/services/meApi.js', () => ({
  createPaymentIntent,
  confirmMockPayment,
  getMyWallet,
}));

import { completeWalletTopUpViaMockPayment } from '../src/services/mockTopUpFlow';

describe('completeWalletTopUpViaMockPayment', () => {
  beforeEach(() => {
    createPaymentIntent.mockReset();
    confirmMockPayment.mockReset();
    getMyWallet.mockReset();
  });

  it('throws when webhook secret missing', async () => {
    await expect(completeWalletTopUpViaMockPayment(10, '')).rejects.toThrow(/secret/i);
  });

  it('creates intent, confirms webhook, returns wallet payload', async () => {
    createPaymentIntent.mockResolvedValueOnce({
      payment: { id: '507f1f77bcf86cd799439011' },
      clientSecret: 'mock_x',
    });
    confirmMockPayment.mockResolvedValueOnce({ payment: { id: '507f1f77bcf86cd799439011', status: 'succeeded' } });
    getMyWallet.mockResolvedValueOnce({ wallet: { balance: 33 }, transactions: [] });

    const out = await completeWalletTopUpViaMockPayment(10, 'test-secret');

    expect(createPaymentIntent).toHaveBeenCalledWith({ purpose: 'top_up', amount: 10 });
    expect(confirmMockPayment).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'test-secret');
    expect(getMyWallet).toHaveBeenCalled();
    expect(out.wallet.balance).toBe(33);
  });

  it('throws when intent has no payment id', async () => {
    createPaymentIntent.mockResolvedValueOnce({ payment: null });
    await expect(completeWalletTopUpViaMockPayment(5, 's')).rejects.toThrow(/payment id/i);
  });
});
