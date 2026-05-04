const STATUS_BADGES = {
  Upcoming: { statusBg: '#E88E3E', statusText: '#ffffff' },
  Completed: { statusBg: '#76A87A', statusText: '#ffffff' },
  Cancelled: { statusBg: '#ff6b6b', statusText: '#ffffff' },
};

function paymentLabel(paymentStatus, paymentMethod) {
  if (paymentStatus === 'paid') return 'Paid';
  if (paymentStatus === 'refunded') return 'Refunded';
  return 'Pending';
}

function displayStatus(b) {
  if (b.status === 'cancelled') return 'Cancelled';
  if (b.status === 'completed') return 'Completed';
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
