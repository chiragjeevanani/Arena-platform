const PLACEHOLDER =
  'https://images.unsplash.com/photo-1626224583764-f87db24d4d83?w=800&q=80';

function formatEnrolledDate(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusFromEnrollment(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'pending' || s === 'confirmed') return 'Upcoming';
  return 'Upcoming';
}

/**
 * Map `GET /api/me/enrollments` row to dashboard / timeline card shape.
 * @param {{ id: string, batchId: string, status: string, createdAt?: string, batchTitle?: string, arenaId?: string }} e
 */
export function mapEnrollmentToDashboardCard(e) {
  const title = (e.batchTitle || 'Coaching batch').trim();
  return {
    id: e.id,
    kind: 'enrollment',
    type: 'Coaching',
    arenaName: title,
    arenaImage: PLACEHOLDER,
    location: e.arenaId ? `Arena #${String(e.arenaId).slice(-6)}` : 'Coaching',
    courtName: 'Batch enrollment',
    coachName: undefined,
    date: formatEnrolledDate(e.createdAt),
    slot: 'See schedule in Coaching',
    status: statusFromEnrollment(e.status),
    price: 0,
    sortKey: e.createdAt || e.id,
    receiptUrl: e.id ? `#receipt-enrollment-${e.id}` : undefined,
    batchId: e.batchId,
  };
}
