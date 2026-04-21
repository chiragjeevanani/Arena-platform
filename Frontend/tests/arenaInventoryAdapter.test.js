import { describe, it, expect } from 'vitest';
import {
  mapArenaInventoryItemToTableRow,
  mapArenaInventoryItemToPosProduct,
} from '../src/utils/arenaInventoryAdapter';

describe('arenaInventoryAdapter', () => {
  const api = {
    id: '507f1f77bcf86cd799439011',
    name: 'Shuttle tube',
    sku: 'SH-01',
    quantity: 12,
    unitPrice: 4.5,
  };

  it('mapArenaInventoryItemToTableRow sets fromApi and coerces numbers', () => {
    const row = mapArenaInventoryItemToTableRow(api);
    expect(row).toMatchObject({
      id: api.id,
      name: 'Shuttle tube',
      category: 'Equipment',
      sku: 'SH-01',
      stock: 12,
      minStock: 5,
      price: 4.5,
      fromApi: true,
    });
  });

  it('mapArenaInventoryItemToPosProduct matches POS cart shape', () => {
    expect(mapArenaInventoryItemToPosProduct(api)).toEqual({
      id: api.id,
      name: 'Shuttle tube',
      price: 4.5,
      category: 'Equipment',
      stock: 12,
      sku: 'SH-01',
    });
  });
});
