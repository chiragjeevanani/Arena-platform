const PLACEHOLDER =
  'https://images.unsplash.com/photo-1626224583764-f87db24d4d83?w=800&q=80';

function statusLabel(b) {
  const s = String(b.status || '').toLowerCase();
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'completed') return 'Completed';
  if (s === 'confirmed' && b.date) {
    const d = new Date(`${b.date}T12:00:00`);
    if (!Number.isNaN(d.getTime()) && d < new Date()) return 'Completed';
    return 'Upcoming';
  }
  return 'Upcoming';
}

/**
 * Map listMyBookings API item + optional arena/court names to dashboard card shape.
 */
export function mapMeBookingToDashboardCard(b, extras = {}) {
  const isCoaching = String(b.type || 'court').toLowerCase() === 'coaching';
  return {
    id: b.id,
    kind: 'booking',
    type: isCoaching ? 'Coaching' : 'Court',
    arenaName: b.arenaName || extras.arenaName || 'Arena',
    arenaImage: b.arenaImage || extras.arenaImage || PLACEHOLDER,
    location: b.location || extras.location || '',
    courtName: b.courtName || extras.courtName || '',
    coachName: extras.coachName,
    plan: extras.plan,
    date: b.date,
    slot: b.timeSlot,
    status: statusLabel(b),
    price: Number(b.amount) || 0,
    receiptUrl: b.id ? `#receipt-${b.id}` : undefined,
    sortKey: b.date ? `${b.date}T12:00:00` : String(b.id || ''),
  };
}

export function mapMeEnrollmentToDashboardCard(e) {
  return {
    id: e.id,
    kind: 'enrollment',
    type: 'COACHING',
    arenaName: e.arenaName || 'Arena',
    arenaImage: e.arenaImage || PLACEHOLDER,
    location: e.location || '',
    coachName: e.coachName || 'Certified Coach',
    courtName: 'Batch enrollment',
    date: e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
    slot: e.timing || 'See schedule in Coaching',
    status: e.status === 'confirmed' ? 'Upcoming' : e.status === 'cancelled' ? 'Cancelled' : 'Upcoming',
    price: Number(e.price) || 0,
    basePrice: Number(e.basePrice) || 0,
    taxPercent: Number(e.taxPercent) || 18,
    days: e.days || '',
    timing: e.timing || '',
    attendance: e.attendance || [],
    metrics: e.metrics || [],
    remarks: e.remarks || '',
    receiptUrl: `#receipt-${e.id}`,
    sortKey: e.createdAt || String(e.id),
  };
}
