const PLACEHOLDER = 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80';

export function mapEventRegistrationToDashboardCard(r) {
  const parts = (r.eventSubtitle || '').split('|').map(s => s.trim());
  return {
    id: r.id,
    kind: 'event-registration',
    type: 'Tournament',
    arenaName: r.eventTitle || 'Tournament',
    arenaImage: r.eventImage || PLACEHOLDER,
    location: parts[2] || 'Main Arena',
    courtName: 'Event Entry',
    date: parts[0] || 'TBA',
    slot: parts[1] || 'TBA',
    status: r.status === 'Rejected' ? 'Cancelled' : 'Upcoming',
    price: parseFloat(parts[3]) || 0,
    sortKey: r.createdAt || r.id,
    receiptUrl: r.id ? `#receipt-event-${r.id}` : undefined,
    eventId: r.eventId,
    inclusions: r.inclusions || [],
  };
}
