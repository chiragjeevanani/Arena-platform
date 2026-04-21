import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}));

import {
  fetchCourtAvailability,
  createMyBooking,
  listMyBookings,
  cancelMyBooking,
} from '../src/services/bookingsApi';

describe('bookingsApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('fetchCourtAvailability GET with date query', async () => {
    apiJsonMock.mockResolvedValueOnce({ slots: [] });
    await fetchCourtAvailability('court1', '2026-04-20');
    expect(apiJsonMock).toHaveBeenCalledWith(
      '/api/public/courts/court1/availability?date=2026-04-20',
      { method: 'GET', skipAuth: true }
    );
  });

  it('createMyBooking POST /api/me/bookings', async () => {
    apiJsonMock.mockResolvedValueOnce({ booking: {} });
    await createMyBooking({
      arenaId: 'a1',
      courtId: 'c1',
      date: '2026-04-20',
      timeSlot: '07:00 PM',
      paymentMethod: 'wallet',
    });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/bookings', {
      method: 'POST',
      body: {
        arenaId: 'a1',
        courtId: 'c1',
        date: '2026-04-20',
        timeSlot: '07:00 PM',
        paymentMethod: 'wallet',
      },
    });
  });

  it('cancelMyBooking PATCH', async () => {
    apiJsonMock.mockResolvedValueOnce({ booking: {} });
    await cancelMyBooking('507f1f77bcf86cd799439011');
    expect(apiJsonMock).toHaveBeenCalledWith(
      '/api/me/bookings/507f1f77bcf86cd799439011/cancel',
      { method: 'PATCH' }
    );
  });

  it('listMyBookings GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ bookings: [] });
    await listMyBookings();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/me/bookings', { method: 'GET' });
  });
});
