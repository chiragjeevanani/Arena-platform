import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}));

import {
  getMyWallet,
  topUpMyWallet,
  listMyMemberships,
  purchaseMembership,
  listMyEnrollments,
  createMyEnrollment,
  cancelMyEnrollment,
  createPaymentIntent,
  listMyPayments,
  confirmMockPayment,
  patchMyProfile,
  listMyAttendance,
} from '../src/services/meApi';

describe('meApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('getMyWallet GET /api/me/wallet', async () => {
    apiJsonMock.mockResolvedValueOnce({ wallet: { balance: 1 }, transactions: [] });
    await getMyWallet();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/wallet', { method: 'GET' });
  });

  it('topUpMyWallet POST body', async () => {
    apiJsonMock.mockResolvedValueOnce({ wallet: { balance: 15 } });
    await topUpMyWallet(15);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/wallet/top-up', {
      method: 'POST',
      body: { amount: 15 },
    });
  });

  it('purchaseMembership POST planId', async () => {
    apiJsonMock.mockResolvedValueOnce({ membership: {}, wallet: {} });
    await purchaseMembership('507f1f77bcf86cd799439011');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/memberships/purchase', {
      method: 'POST',
      body: { planId: '507f1f77bcf86cd799439011' },
    });
  });

  it('createMyEnrollment POST batchId', async () => {
    apiJsonMock.mockResolvedValueOnce({ enrollment: {} });
    await createMyEnrollment('507f1f77bcf86cd799439012');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/enrollments', {
      method: 'POST',
      body: { batchId: '507f1f77bcf86cd799439012' },
    });
  });

  it('cancelMyEnrollment PATCH', async () => {
    apiJsonMock.mockResolvedValueOnce({ enrollment: {} });
    await cancelMyEnrollment('e1');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/enrollments/e1/cancel', { method: 'PATCH' });
  });

  it('createPaymentIntent POST', async () => {
    apiJsonMock.mockResolvedValueOnce({ payment: {}, clientSecret: 'x', provider: 'mock' });
    await createPaymentIntent({ purpose: 'top_up', amount: 20 });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/payments/intent', {
      method: 'POST',
      body: { purpose: 'top_up', amount: 20 },
    });
  });

  it('confirmMockPayment POST webhook with secret header', async () => {
    apiJsonMock.mockResolvedValueOnce({ payment: {} });
    await confirmMockPayment('pay1', 'secret-value');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/webhooks/payments/mock', {
      method: 'POST',
      body: { paymentId: 'pay1' },
      skipAuth: true,
      headers: { 'X-Mock-Payment-Secret': 'secret-value' },
    });
  });

  it('listMyPayments GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ payments: [] });
    await listMyPayments();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/payments', { method: 'GET' });
  });

  it('listMyMemberships GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ memberships: [] });
    await listMyMemberships();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/memberships', { method: 'GET' });
  });

  it('listMyEnrollments GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ enrollments: [] });
    await listMyEnrollments();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/enrollments', { method: 'GET' });
  });

  it('patchMyProfile PATCH', async () => {
    apiJsonMock.mockResolvedValueOnce({ user: {} });
    await patchMyProfile({ name: 'A', phone: '1' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/profile', {
      method: 'PATCH',
      body: { name: 'A', phone: '1' },
    });
  });

  it('listMyAttendance GET with month', async () => {
    apiJsonMock.mockResolvedValueOnce({ sessions: [] });
    await listMyAttendance({ month: '2026-04' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/attendance?month=2026-04', { method: 'GET' });
  });
});
