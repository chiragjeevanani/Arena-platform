import { describe, it, expect } from 'vitest';
import { mapMeBookingToDashboardCard } from '../src/utils/meBookingAdapter';

describe('mapMeBookingToDashboardCard', () => {
  it('maps court booking with arena and court names', () => {
    const card = mapMeBookingToDashboardCard(
      {
        id: 'b1',
        date: '2099-01-01',
        timeSlot: '08:00 PM',
        status: 'confirmed',
        amount: 10,
        type: 'court',
      },
      { arenaName: 'Arena X', courtName: 'C1' }
    );
    expect(card.id).toBe('b1');
    expect(card.kind).toBe('booking');
    expect(card.sortKey).toBe('2099-01-01T12:00:00');
    expect(card.type).toBe('Court');
    expect(card.arenaName).toBe('Arena X');
    expect(card.courtName).toBe('C1');
    expect(card.slot).toBe('08:00 PM');
    expect(card.price).toBe(10);
    expect(card.status).toBe('Upcoming');
  });

  it('marks past confirmed booking as Completed', () => {
    const card = mapMeBookingToDashboardCard({
      id: 'b2',
      date: '2020-01-01',
      timeSlot: '10:00 AM',
      status: 'confirmed',
      amount: 5,
      type: 'court',
    });
    expect(card.status).toBe('Completed');
  });

  it('maps coaching type', () => {
    const card = mapMeBookingToDashboardCard({
      id: 'b3',
      date: '2099-06-01',
      timeSlot: 'Morning',
      status: 'confirmed',
      amount: 0,
      type: 'coaching',
    });
    expect(card.type).toBe('Coaching');
  });
});
