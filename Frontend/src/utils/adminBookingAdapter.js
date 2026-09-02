import { isSlotTimePassed } from './slotTime';

const STATUS_BADGES = {
  Upcoming: { statusBg: '#E88E3E', statusText: '#ffffff' },
  Completed: { statusBg: '#76A87A', statusText: '#ffffff' },
  Cancelled: { statusBg: '#ff6b6b', statusText: '#ffffff' },
  Rescheduled: { statusBg: '#3b82f6', statusText: '#ffffff' },
  Refunded: { statusBg: '#64748b', statusText: '#ffffff' },
};

function paymentLabel(paymentStatus, paymentMethod) {
  if (paymentStatus === 'paid') return 'Paid';
  if (paymentStatus === 'refunded') return 'Refunded';
  return 'Pending';
}

function displayStatus(b) {
  if (b.status === 'cancelled') return 'Cancelled';
  if (b.status === 'completed') return 'Completed';
  if (b.status === 'rescheduled') return 'Rescheduled';
  if (b.paymentStatus === 'refunded') return 'Refunded';
  // Mirror meBookingAdapter.js: a 'confirmed'/'pending' booking whose slot time
  // has already passed reads as Completed here too, so the admin ledger never
  // disagrees with what the customer sees on their own Dashboard for the same
  // booking.
  if ((b.status === 'confirmed' || b.status === 'pending') && b.date && isSlotTimePassed(b.date, b.timeSlot)) {
    return 'Completed';
  }
  return 'Upcoming';
}

/**
 * Map GET /api/admin/bookings row to admin Bookings.jsx table row.
 */
export function mapAdminBookingToLedgerRow(b) {
  const uiStatus = displayStatus(b);
  const badges = STATUS_BADGES[uiStatus] || STATUS_BADGES.Upcoming;
  const payment = paymentLabel(b.paymentStatus, b.paymentMethod);
  const method = (b.paymentMethod || 'online').replace(/^./, (c) => c.toUpperCase());

  return {
    bookingId: b.id,
    id: `#${String(b.id).slice(-8)}`,
    customer: b.userName || `User …${String(b.userId || '').slice(-6)}`,
    customerPhone: b.userPhone || '',
    arena: b.arenaName || '—',
    court: b.courtName || '—',
    date: b.date || '—',
    time: b.timeSlot || '—',
    amount: Number(b.amount) || 0,
    payment,
    paymentMethod: method === 'Wallet' ? 'Wallet' : method === 'Online' ? 'Online' : method,
    status: uiStatus,
    statusBg: badges.statusBg,
    statusText: badges.statusText,
    raw: b,
  };
}
