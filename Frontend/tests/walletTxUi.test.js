import { describe, it, expect } from 'vitest';
import { mapWalletTransactionToRow } from '../src/utils/walletTxUi';

describe('mapWalletTransactionToRow', () => {
  it('maps credit top_up', () => {
    const row = mapWalletTransactionToRow({
      id: 'tx1',
      type: 'credit',
      amount: 25,
      reason: 'top_up',
      createdAt: '2026-04-19T10:00:00.000Z',
      meta: { source: 'mock_webhook' },
    });
    expect(row.type).toBe('received');
    expect(row.amount).toBe(25);
    expect(row.title).toMatch(/top up/i);
    expect(row.subtitle).toBe('Mock payment');
  });

  it('maps debit membership_purchase', () => {
    const row = mapWalletTransactionToRow({
      id: 'tx2',
      type: 'debit',
      amount: 40,
      reason: 'membership_purchase',
      createdAt: '2026-04-18T12:00:00.000Z',
      meta: {},
    });
    expect(row.type).toBe('spent');
    expect(row.amount).toBe(-40);
  });
});
