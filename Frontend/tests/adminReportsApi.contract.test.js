import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
}));

import { getAdminReportSummary } from '../src/services/adminReportsApi';

describe('adminReportsApi', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('getAdminReportSummary GET', async () => {
    apiJsonMock.mockResolvedValueOnce({});
    await getAdminReportSummary({ from: '2026-01-01', to: '2026-01-31', arenaId: 'a1' });
    expect(apiJsonMock).toHaveBeenCalledWith(
      '/api/admin/reports/summary?arenaId=a1&from=2026-01-01&to=2026-01-31',
      { method: 'GET' }
    );
  });
});
