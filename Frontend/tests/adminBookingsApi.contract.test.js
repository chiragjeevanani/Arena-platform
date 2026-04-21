import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}));

import { listAdminBookings, updateAdminBooking } from '../src/services/adminBookingsApi';

describe('adminBookingsApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('listAdminBookings GET without query', async () => {
    apiJsonMock.mockResolvedValueOnce({ bookings: [] });
    await listAdminBookings();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/bookings', { method: 'GET' });
  });

  it('listAdminBookings GET with arenaId and date', async () => {
    apiJsonMock.mockResolvedValueOnce({ bookings: [] });
    await listAdminBookings({ arenaId: 'a1', date: '2026-04-20' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/bookings?arenaId=a1&date=2026-04-20', {
      method: 'GET',
    });
  });

  it('updateAdminBooking PATCH status', async () => {
    apiJsonMock.mockResolvedValueOnce({ booking: {} });
    await updateAdminBooking('bid1', { status: 'cancelled' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/bookings/bid1', {
      method: 'PATCH',
      body: { status: 'cancelled' },
    });
  });
});
