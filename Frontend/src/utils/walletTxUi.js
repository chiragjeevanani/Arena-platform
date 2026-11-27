const REASON_LABELS = {
  top_up: 'Wallet top up',
  booking_payment: 'Court booking',
  refund: 'Refund',
  membership_purchase: 'Membership',
  membership_slot_purchase: 'Slot membership',
  admin_adjustment: 'Adjustment',
  referral_reward: 'Referral reward',
  welcome_reward: 'Welcome reward',
  coaching_enrollment: 'Coaching enrolment',
  coaching_fee: 'Coaching monthly fee',
  event_registration: 'Event registration',
};

export function mapWalletTransactionToRow(t) {
  const received = t.type === 'credit';
  const label = REASON_LABELS[t.reason] || t.reason || 'Transaction';
  const subtitle =
    t.meta?.source === 'mock_webhook'
      ? 'Mock payment'
      : t.meta?.bookingId
        ? `Booking …${String(t.meta.bookingId).slice(-6)}`
        : '';

  return {
    id: t.id,
    title: label,
    subtitle,
    date: t.createdAt ? new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—',
    amount: received ? Number(t.amount) : -Number(t.amount),
    type: received ? 'received' : 'spent',
    ref: `#${String(t.id).slice(-8)}`,
  };
}
