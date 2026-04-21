import { describe, it, expect } from 'vitest';
import { isMongoObjectId } from '../src/utils/mongoId';

describe('isMongoObjectId', () => {
  it('returns true for 24 hex string', () => {
    expect(isMongoObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  it('returns false for short or non-hex ids', () => {
    expect(isMongoObjectId('BK-123')).toBe(false);
    expect(isMongoObjectId('')).toBe(false);
    expect(isMongoObjectId(null)).toBe(false);
  });
});
