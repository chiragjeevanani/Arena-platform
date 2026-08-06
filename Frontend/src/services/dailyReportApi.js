import { apiJson } from './apiClient';

/**
 * Fetch the Daily Court Booking Report.
 * For Super Admin: uses /api/admin/reports/daily (must include arenaId)
 * For Arena Admin: uses /api/arena-admin/reports/daily (arenaId auto-scoped server-side)
 *
 * @param {object} params - Query parameters { arenaId, from, to, courtId, status, paymentMethod, search, page, limit }
 * @param {'SUPER_ADMIN'|'ARENA_ADMIN'|string} role - User role determines the endpoint
 */
export function getDailyCourtReport(params = {}, role = 'SUPER_ADMIN') {
  const base = role === 'SUPER_ADMIN' ? '/api/admin' : '/api/arena-admin';
  const q = new URLSearchParams();
  if (params.arenaId) q.set('arenaId', params.arenaId);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  if (params.courtId) q.set('courtId', params.courtId);
  if (params.status && params.status !== 'all') q.set('status', params.status);
  if (params.paymentMethod) q.set('paymentMethod', params.paymentMethod);
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', params.page);
  if (params.limit) q.set('limit', params.limit);
  const qs = q.toString();
  return apiJson(`${base}/reports/daily${qs ? `?${qs}` : ''}`);
}
