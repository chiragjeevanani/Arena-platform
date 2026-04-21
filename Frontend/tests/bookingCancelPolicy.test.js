import { describe, it, expect } from 'vitest';
import { shouldCancelBookingViaApi, shouldCancelEnrollmentViaApi } from '../src/utils/bookingCancelPolicy';

describe('shouldCancelBookingViaApi', () => {
  it('true for court booking with mongo id when api and token', () => {
    expect(
      shouldCancelBookingViaApi(
        { id: '507f1f77bcf86cd799439011', type: 'Court' },
        true,
        true
      )
    ).toBe(true);
  });

  it('false for coaching rows', () => {
    expect(
      shouldCancelBookingViaApi(
        { id: '507f1f77bcf86cd799439011', type: 'Coaching' },
        true,
        true
      )
    ).toBe(false);
  });

  it('false without token or api', () => {
    expect(shouldCancelBookingViaApi({ id: '507f1f77bcf86cd799439011', type: 'Court' }, true, false)).toBe(
      false
    );
    expect(shouldCancelBookingViaApi({ id: '507f1f77bcf86cd799439011', type: 'Court' }, false, true)).toBe(
      false
    );
  });

  it('false for enrollment-shaped rows (kind)', () => {
    expect(
      shouldCancelBookingViaApi(
        { id: '507f1f77bcf86cd799439011', kind: 'enrollment', type: 'Coaching' },
        true,
        true
      )
    ).toBe(false);
  });
});

describe('shouldCancelEnrollmentViaApi', () => {
  it('true for enrollment kind with mongo id when api and token', () => {
    expect(
      shouldCancelEnrollmentViaApi(
        { id: '507f1f77bcf86cd799439011', kind: 'enrollment', type: 'Coaching' },
        true,
        true
      )
    ).toBe(true);
  });

  it('false for court bookings', () => {
    expect(
      shouldCancelEnrollmentViaApi(
        { id: '507f1f77bcf86cd799439011', kind: 'booking', type: 'Court' },
        true,
        true
      )
    ).toBe(false);
  });
});
