import { describe, it, expect } from 'vitest';
import { mapEnrollmentToDashboardCard } from '../src/utils/enrollmentAdapter';

describe('mapEnrollmentToDashboardCard', () => {
  it('maps API enrollment to coaching card', () => {
    const card = mapEnrollmentToDashboardCard({
      id: '507f1f77bcf86cd799439011',
      batchId: '507f1f77bcf86cd799439012',
      status: 'confirmed',
      createdAt: '2026-01-15T10:00:00.000Z',
      batchTitle: 'Beginners batch',
      arenaId: '507f1f77bcf86cd799439013',
    });
    expect(card.kind).toBe('enrollment');
    expect(card.type).toBe('Coaching');
    expect(card.arenaName).toBe('Beginners batch');
    expect(card.status).toBe('Upcoming');
    expect(card.receiptUrl).toBe('#receipt-enrollment-507f1f77bcf86cd799439011');
  });

  it('maps cancelled status', () => {
    const card = mapEnrollmentToDashboardCard({
      id: 'e1',
      batchId: 'b1',
      status: 'cancelled',
      createdAt: '2026-02-01T00:00:00.000Z',
    });
    expect(card.status).toBe('Cancelled');
  });
});
