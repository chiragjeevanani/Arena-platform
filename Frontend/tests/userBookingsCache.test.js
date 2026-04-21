import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pruneUserBookingsLocalCache } from '../src/utils/userBookingsCache';

describe('pruneUserBookingsLocalCache', () => {
  const orig = globalThis.localStorage;

  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => {
        store.set(k, String(v));
      },
    };
  });

  afterEach(() => {
    globalThis.localStorage = orig;
  });

  it('removes rows whose id matches a server booking id', () => {
    globalThis.localStorage.setItem(
      'userBookings',
      JSON.stringify([{ id: 'a' }, { id: 'b' }])
    );
    pruneUserBookingsLocalCache({ bookingIds: ['a'], enrollmentIds: [] });
    expect(JSON.parse(globalThis.localStorage.getItem('userBookings'))).toEqual([{ id: 'b' }]);
  });

  it('removes rows whose id matches a server enrollment id', () => {
    globalThis.localStorage.setItem('userBookings', JSON.stringify([{ id: 'e1' }]));
    pruneUserBookingsLocalCache({ bookingIds: [], enrollmentIds: ['e1'] });
    expect(JSON.parse(globalThis.localStorage.getItem('userBookings'))).toEqual([]);
  });

  it('ignores corrupt JSON', () => {
    globalThis.localStorage.setItem('userBookings', 'not-json');
    pruneUserBookingsLocalCache({ bookingIds: ['x'], enrollmentIds: [] });
    expect(globalThis.localStorage.getItem('userBookings')).toBe('not-json');
  });
});
