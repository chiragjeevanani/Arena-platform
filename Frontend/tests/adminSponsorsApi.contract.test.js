import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
}));

import { listAdminSponsors, createAdminSponsor, deleteAdminSponsor } from '../src/services/adminSponsorsApi';

describe('adminSponsorsApi', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('listAdminSponsors GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ sponsors: [] });
    await listAdminSponsors({ status: 'Active' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/sponsors?status=Active', { method: 'GET' });
  });

  it('createAdminSponsor POST', async () => {
    apiJsonMock.mockResolvedValueOnce({ sponsor: {} });
    await createAdminSponsor({ name: 'Acme' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/sponsors', {
      method: 'POST',
      body: { name: 'Acme' },
    });
  });

  it('deleteAdminSponsor DELETE', async () => {
    apiJsonMock.mockResolvedValueOnce({ ok: true });
    await deleteAdminSponsor('s1');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/sponsors/s1', { method: 'DELETE' });
  });
});
