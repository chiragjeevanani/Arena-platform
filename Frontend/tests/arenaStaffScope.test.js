import { describe, it, expect } from 'vitest';
import { getArenaStaffArenaId } from '../src/utils/arenaStaffScope';

describe('arenaStaffScope', () => {
  it('returns null for customer or missing role', () => {
    expect(getArenaStaffArenaId(null)).toBeNull();
    expect(getArenaStaffArenaId({ role: 'CUSTOMER', assignedArena: '507f1f77bcf86cd799439011' })).toBeNull();
  });

  it('returns null when assigned arena is missing or sentinel', () => {
    expect(getArenaStaffArenaId({ role: 'ARENA_ADMIN' })).toBeNull();
    expect(getArenaStaffArenaId({ role: 'RECEPTIONIST', assignedArena: 'all' })).toBeNull();
  });

  it('returns arena id for ARENA_ADMIN and RECEPTIONIST', () => {
    const id = '507f1f77bcf86cd799439011';
    expect(getArenaStaffArenaId({ role: 'ARENA_ADMIN', assignedArena: id })).toBe(id);
    expect(getArenaStaffArenaId({ role: 'RECEPTIONIST', assignedArena: id })).toBe(id);
  });
});
