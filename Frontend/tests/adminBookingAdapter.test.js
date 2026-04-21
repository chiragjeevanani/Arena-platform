import { describe, it, expect } from 'vitest';
import { mapAdminBookingToLedgerRow } from '../src/utils/adminBookingAdapter';

describe('mapAdminBookingToLedgerRow', () => {
  it('maps API booking to ledger row with bookingId for PATCH', () => {
    const row = mapAdminBookingToLedgerRow({
      id: '507f1f77bcf86cd799439011',
      userId: '507f191e810c19729de860ea',
      arenaId: 'a1',
      courtId: 'c1',
      date: '2026-04-20',
      timeSlot: '07:00 PM',
      status: 'confirmed',
      amount: 12.5,
      paymentStatus: 'paid',
      paymentMethod: 'wallet',
      arenaName: 'Test Arena',
      courtName: 'Court A',
    });

    expect(row.bookingId).toBe('507f1f77bcf86cd799439011');
    expect(row.id.startsWith('#')).toBe(true);
    expect(row.customer).toContain('860ea');
    expect(row.arena).toBe('Test Arena');
    expect(row.court).toBe('Court A');
    expect(row.date).toBe('2026-04-20');
    expect(row.time).toBe('07:00 PM');
    expect(row.amount).toBe(12.5);
    expect(row.payment).toBe('Paid');
    expect(row.status).toBe('Upcoming');
  });

  it('maps cancelled status', () => {
    const row = mapAdminBookingToLedgerRow({
      id: '507f1f77bcf86cd799439012',
      userId: 'u1',
      arenaId: 'a1',
      courtId: 'c1',
      date: '2026-01-01',
      timeSlot: '10:00 AM',
      status: 'cancelled',
      amount: 5,
      paymentStatus: 'pending',
      paymentMethod: 'online',
      arenaName: 'X',
      courtName: 'Y',
    });
    expect(row.status).toBe('Cancelled');
    expect(row.payment).toBe('Pending');
  });
});
