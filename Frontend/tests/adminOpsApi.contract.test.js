import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}));

import {
  listAdminInventoryItems,
  createAdminInventoryItem,
  updateAdminInventoryItem,
  createAdminPosSale,
  listAdminPosSales,
  listAdminCmsContent,
  createAdminCmsContent,
  updateAdminCmsContent,
  deleteAdminCmsContent,
} from '../src/services/adminOpsApi';

const ARENA = '507f1f77bcf86cd799439011';

describe('adminOpsApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('inventory GET requires arenaId', async () => {
    await expect(listAdminInventoryItems({})).rejects.toThrow(/arenaId/i);
  });

  it('inventory GET, POST, PATCH', async () => {
    apiJsonMock.mockResolvedValueOnce({ items: [] });
    await listAdminInventoryItems({ arenaId: ARENA });
    expect(apiJsonMock).toHaveBeenCalledWith(`/api/admin/inventory?arenaId=${ARENA}`, { method: 'GET' });

    apiJsonMock.mockResolvedValueOnce({ item: {} });
    await createAdminInventoryItem({ arenaId: ARENA, name: 'X', quantity: 1 });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/inventory', {
      method: 'POST',
      body: { arenaId: ARENA, name: 'X', quantity: 1 },
    });

    apiJsonMock.mockResolvedValueOnce({ item: {} });
    await updateAdminInventoryItem('i1', { quantity: 2 });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/inventory/i1', {
      method: 'PATCH',
      body: { quantity: 2 },
    });
  });

  it('pos sales POST and GET', async () => {
    const body = { arenaId: ARENA, lines: [{ inventoryItemId: 'x', qty: 1 }] };
    apiJsonMock.mockResolvedValueOnce({ sale: {} });
    await createAdminPosSale(body);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/pos/sales', { method: 'POST', body });

    apiJsonMock.mockResolvedValueOnce({ sales: [] });
    await listAdminPosSales(ARENA);
    expect(apiJsonMock).toHaveBeenCalledWith(`/api/admin/pos/sales?arenaId=${ARENA}`, { method: 'GET' });
  });

  it('cms GET with kind only or arenaId+kind', async () => {
    apiJsonMock.mockResolvedValueOnce({ contents: [] });
    await listAdminCmsContent({ kind: 'event' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/cms?kind=event', { method: 'GET' });

    apiJsonMock.mockResolvedValueOnce({ contents: [] });
    await listAdminCmsContent({ arenaId: ARENA, kind: 'event' });
    expect(apiJsonMock).toHaveBeenCalledWith(
      `/api/admin/cms?arenaId=${ARENA}&kind=event`,
      { method: 'GET' }
    );
  });

  it('cms POST, PATCH, DELETE', async () => {
    apiJsonMock.mockResolvedValueOnce({ content: {} });
    await createAdminCmsContent({ kind: 'hero', title: 'H' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/cms', {
      method: 'POST',
      body: { kind: 'hero', title: 'H' },
    });

    apiJsonMock.mockResolvedValueOnce({ content: {} });
    await updateAdminCmsContent('c1', { title: 'T2' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/cms/c1', {
      method: 'PATCH',
      body: { title: 'T2' },
    });

    apiJsonMock.mockResolvedValueOnce(undefined);
    await deleteAdminCmsContent('c1');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/cms/c1', { method: 'DELETE' });
  });
});
