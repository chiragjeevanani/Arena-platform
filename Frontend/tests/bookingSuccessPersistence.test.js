import { describe, it, expect } from 'vitest';
import { shouldPersistBookingSuccessToUserBookings } from '../src/utils/bookingSuccessPersistence';

const ARENA = '507f1f77bcf86cd799439011';

describe('bookingSuccessPersistence', () => {
  const ctx = { apiConfigured: true, hasToken: true };

  it('returns false for null state', () => {
    expect(shouldPersistBookingSuccessToUserBookings(null, ctx)).toBe(false);
  });

  it('never persists wallet top-up as a user booking row', () => {
    expect(
      shouldPersistBookingSuccessToUserBookings({ type: 'wallet_top_up', amount: 10 }, ctx)
    ).toBe(false);
  });

  it('persists membership rows (local receipt) even with API', () => {
    expect(
      shouldPersistBookingSuccessToUserBookings(
        { type: 'membership', plan: { name: 'Gold' }, amount: 50 },
        ctx
      )
    ).toBe(true);
  });

  it('skips court booking when API returned a Mongo booking id', () => {
    expect(
      shouldPersistBookingSuccessToUserBookings(
        { booking: { id: ARENA }, arena: { name: 'A' } },
        ctx
      )
    ).toBe(false);
  });

  it('persists mock court id without API', () => {
    expect(
      shouldPersistBookingSuccessToUserBookings(
        { booking: { id: 'BK-ABC12' }, arena: { name: 'A' } },
        { apiConfigured: false, hasToken: false }
      )
    ).toBe(true);
  });

  it('skips coaching row when enrollment has Mongo id', () => {
    expect(
      shouldPersistBookingSuccessToUserBookings(
        {
          batch: { title: 'Morning' },
          enrollment: { id: ARENA },
        },
        ctx
      )
    ).toBe(false);
  });
});
