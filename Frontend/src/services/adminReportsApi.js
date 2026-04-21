import { apiJson } from './apiClient';

export function getAdminReportSummary({ arenaId, from, to } = {}) {
  const q = new URLSearchParams();
  if (arenaId) q.set('arenaId', arenaId);
  if (from) q.set('from', from);
  if (to) q.set('to', to);
  const qs = q.toString();
  return apiJson(`/api/admin/reports/summary${qs ? `?${qs}` : ''}`, { method: 'GET' });
}
