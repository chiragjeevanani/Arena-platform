import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
}));

import {
  listArenaAdminBookings,
  updateArenaAdminBooking,
  createArenaAdminMembershipPlan,
  listArenaAdminMembershipPlans,
  createArenaAdminCoachingBatch,
  listArenaAdminCoachingBatches,
  updateArenaAdminCoachingBatch,
  createArenaAdminInventoryItem,
  listArenaAdminInventoryItems,
  updateArenaAdminInventoryItem,
  createArenaAdminPosSale,
  listArenaAdminPosSales,
  createArenaAdminCmsContent,
  listArenaAdminCmsContent,
  updateArenaAdminCmsContent,
  deleteArenaAdminCmsContent,
} from '../src/services/arenaAdminApi';

const ARENA = '507f1f77bcf86cd799439011';

describe('arenaAdminApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('listArenaAdminBookings requires arenaId', async () => {
    await expect(listArenaAdminBookings({})).rejects.toThrow(/arenaId/i);
  });

  it('listArenaAdminBookings GET with arenaId and date', async () => {
    apiJsonMock.mockResolvedValueOnce({ bookings: [] });
    await listArenaAdminBookings({ arenaId: ARENA, date: '2026-04-20' });
    expect(apiJsonMock).toHaveBeenCalledWith(
      `/api/arena-admin/bookings?arenaId=${ARENA}&date=2026-04-20`,
      { method: 'GET' }
    );
  });

  it('updateArenaAdminBooking PATCH', async () => {
    apiJsonMock.mockResolvedValueOnce({ booking: {} });
    await updateArenaAdminBooking('bid1', { status: 'completed' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/bookings/bid1', {
      method: 'PATCH',
      body: { status: 'completed' },
    });
  });

  it('membership plans POST and GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ plan: {} });
    const body = { arenaId: ARENA, name: 'P', price: 10, durationDays: 30, discountPercent: 0 };
    await createArenaAdminMembershipPlan(body);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/membership-plans', {
      method: 'POST',
      body,
    });

    apiJsonMock.mockResolvedValueOnce({ plans: [] });
    await listArenaAdminMembershipPlans(ARENA);
    expect(apiJsonMock).toHaveBeenCalledWith(
      `/api/arena-admin/membership-plans?arenaId=${ARENA}`,
      { method: 'GET' }
    );
  });

  it('coaching batches POST, GET, PATCH', async () => {
    const batchBody = {
      arenaId: ARENA,
      coachId: '507f191e810c19729de860ea',
      title: 'Morning',
      capacity: 8,
      startDate: '2026-05-01',
      endDate: '2026-06-01',
    };
    apiJsonMock.mockResolvedValueOnce({ batch: {} });
    await createArenaAdminCoachingBatch(batchBody);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/coaching-batches', {
      method: 'POST',
      body: batchBody,
    });

    apiJsonMock.mockResolvedValueOnce({ batches: [] });
    await listArenaAdminCoachingBatches(ARENA);
    expect(apiJsonMock).toHaveBeenCalledWith(
      `/api/arena-admin/coaching-batches?arenaId=${ARENA}`,
      { method: 'GET' }
    );

    apiJsonMock.mockResolvedValueOnce({ batch: {} });
    await updateArenaAdminCoachingBatch('batch1', { isPublished: true });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/coaching-batches/batch1', {
      method: 'PATCH',
      body: { isPublished: true },
    });
  });

  it('inventory POST, GET, PATCH', async () => {
    const invBody = { arenaId: ARENA, name: 'Shuttle', quantity: 10 };
    apiJsonMock.mockResolvedValueOnce({ item: {} });
    await createArenaAdminInventoryItem(invBody);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/inventory', {
      method: 'POST',
      body: invBody,
    });

    apiJsonMock.mockResolvedValueOnce({ items: [] });
    await listArenaAdminInventoryItems(ARENA);
    expect(apiJsonMock).toHaveBeenCalledWith(`/api/arena-admin/inventory?arenaId=${ARENA}`, {
      method: 'GET',
    });

    apiJsonMock.mockResolvedValueOnce({ item: {} });
    await updateArenaAdminInventoryItem('item1', { quantity: 5 });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/inventory/item1', {
      method: 'PATCH',
      body: { quantity: 5 },
    });
  });

  it('POS sales POST and GET', async () => {
    const saleBody = {
      arenaId: ARENA,
      lines: [{ inventoryItemId: '507f191e810c19729de860ea', qty: 1 }],
    };
    apiJsonMock.mockResolvedValueOnce({ sale: {} });
    await createArenaAdminPosSale(saleBody);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/pos/sales', {
      method: 'POST',
      body: saleBody,
    });

    apiJsonMock.mockResolvedValueOnce({ sales: [] });
    await listArenaAdminPosSales(ARENA);
    expect(apiJsonMock).toHaveBeenCalledWith(`/api/arena-admin/pos/sales?arenaId=${ARENA}`, {
      method: 'GET',
    });
  });

  it('cms POST, GET with kind, PATCH, DELETE', async () => {
    const cmsBody = { arenaId: ARENA, kind: 'hero', title: 'Welcome', isPublished: true };
    apiJsonMock.mockResolvedValueOnce({ content: {} });
    await createArenaAdminCmsContent(cmsBody);
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/cms', { method: 'POST', body: cmsBody });

    apiJsonMock.mockResolvedValueOnce({ contents: [] });
    await listArenaAdminCmsContent({ arenaId: ARENA, kind: 'event' });
    expect(apiJsonMock).toHaveBeenCalledWith(
      `/api/arena-admin/cms?arenaId=${ARENA}&kind=event`,
      { method: 'GET' }
    );

    apiJsonMock.mockResolvedValueOnce({ content: {} });
    await updateArenaAdminCmsContent('cid1', { title: 'X' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/cms/cid1', {
      method: 'PATCH',
      body: { title: 'X' },
    });

    apiJsonMock.mockResolvedValueOnce({ ok: true });
    await deleteArenaAdminCmsContent('cid1');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/arena-admin/cms/cid1', { method: 'DELETE' });
  });
});
