import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
}));

import { listAdminUsers, patchAdminUser } from '../src/services/adminUsersApi';

describe('adminUsersApi', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('listAdminUsers GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ users: [], total: 0 });
    await listAdminUsers({ role: 'COACH', limit: 10 });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/users?role=COACH&limit=10', { method: 'GET' });
  });

  it('patchAdminUser PATCH', async () => {
    apiJsonMock.mockResolvedValueOnce({ user: {} });
    await patchAdminUser('u1', { isActive: false });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/admin/users/u1', {
      method: 'PATCH',
      body: { isActive: false },
    });
  });
});
