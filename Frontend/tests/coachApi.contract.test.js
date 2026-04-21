import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
}));

import {
  listCoachStudentsAll,
  listCoachAttendanceHistory,
  upsertBatchAttendance,
} from '../src/services/coachApi';

describe('coachApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('listCoachStudentsAll GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ students: [] });
    await listCoachStudentsAll();
    expect(apiJsonMock).toHaveBeenCalledWith('/api/coach/students', { method: 'GET' });
  });

  it('listCoachAttendanceHistory GET', async () => {
    apiJsonMock.mockResolvedValueOnce({ sessions: [] });
    await listCoachAttendanceHistory({ from: '2026-01-01', to: '2026-01-31' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/coach/attendance-history?from=2026-01-01&to=2026-01-31', {
      method: 'GET',
    });
  });

  it('upsertBatchAttendance PUT', async () => {
    apiJsonMock.mockResolvedValueOnce({ attendance: {} });
    await upsertBatchAttendance('b1', { sessionDate: '2026-04-01', records: [] });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/coach/batches/b1/attendance', {
      method: 'PUT',
      body: { sessionDate: '2026-04-01', records: [] },
    });
  });
});
