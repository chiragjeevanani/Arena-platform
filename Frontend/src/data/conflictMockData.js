import AmmArena1 from '../assets/Arenas/AmmArena1.jpeg';

// ─── Helper: date math ───────────────────────────────────────────────────────
export const parseDate = (str) => new Date(str + 'T00:00:00');

export const formatDate = (date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/** Returns every date (as yyyy-mm-dd string) between start and end inclusive */
export const dateRange = (start, end) => {
  const dates = [];
  let cur = new Date(start);
  while (cur <= new Date(end)) {
    dates.push(cur.toISOString().split('T')[0]);
    cur = addDays(cur, 1);
  }
  return dates;
};

/** Count how many days two ranges overlap */
export const overlapDays = (aStart, aEnd, bStart, bEnd) => {
  const a = dateRange(aStart, aEnd);
  const b = new Set(dateRange(bStart, bEnd));
  return a.filter((d) => b.has(d)).length;
};

// ─── Mock conflict-affected bookings ─────────────────────────────────────────
export const CONFLICT_BOOKINGS = [
  {
    id: 'CB-0011',
    arenaName: 'Amm Sports Arena',
    arenaImage: AmmArena1,
    location: 'Sector 62, Noida',
    courtName: 'Court 2',
    slot: '07:00 PM – 08:00 PM',
    status: 'Upcoming',
    price: 4.5,
    // Membership / court plan period
    startDate: '2025-01-01',
    originalEndDate: '2025-01-31',
    // Conflicting event
    event: {
      name: 'Winter Badminton Championship',
      startDate: '2025-01-10',
      endDate: '2025-01-20',
      description: 'Annual club-level championship hosted on Court 2.',
    },
  },
  {
    id: 'CB-0012',
    arenaName: 'Amm Sports Arena',
    arenaImage: AmmArena1,
    location: 'Sector 62, Noida',
    courtName: 'Court 1',
    slot: '06:00 AM – 08:00 AM',
    status: 'Upcoming',
    price: 4.0,
    startDate: '2025-02-01',
    originalEndDate: '2025-02-28',
    event: {
      name: 'Doubles Open – Feb Edition',
      startDate: '2025-02-15',
      endDate: '2025-02-22',
      description: 'Open doubles tournament requiring full court closure.',
    },
  },
];

/**
 * Derive the computed conflict fields for a booking:
 *  - overlappingDays
 *  - finalEndDate
 *  - bookedDates / eventDates / extendedDates  (for calendar)
 */
export const resolveConflict = (booking) => {
  const { startDate, originalEndDate, event } = booking;

  const blocked = overlapDays(
    startDate,
    originalEndDate,
    event.startDate,
    event.endDate
  );

  const finalEnd = addDays(new Date(originalEndDate), blocked);
  const finalEndStr = finalEnd.toISOString().split('T')[0];

  // individual date sets for calendar colouring
  const bookedDates = new Set(dateRange(startDate, originalEndDate));
  const eventDates = new Set(dateRange(event.startDate, event.endDate));
  const extendedDates = new Set(
    dateRange(addDays(new Date(originalEndDate), 1).toISOString().split('T')[0], finalEndStr)
  );

  // Day classification for each calendar cell
  const classifyDate = (dateStr) => {
    const inBooked = bookedDates.has(dateStr);
    const inEvent = eventDates.has(dateStr);
    const inExtended = extendedDates.has(dateStr);
    if (inBooked && inEvent) return 'overlap';   // orange
    if (inEvent && !inBooked) return 'event';    // red  (event outside booking – rare)
    if (inBooked) return 'booked';               // green
    if (inExtended) return 'extended';           // blue
    return 'none';
  };

  return {
    ...booking,
    overlappingDays: blocked,
    finalEndDate: finalEndStr,
    classifyDate,
    // Formatted labels
    fmtStart: formatDate(parseDate(startDate)),
    fmtOrigEnd: formatDate(parseDate(originalEndDate)),
    fmtFinalEnd: formatDate(finalEnd),
    fmtEventStart: formatDate(parseDate(event.startDate)),
    fmtEventEnd: formatDate(parseDate(event.endDate)),
  };
};

export const RESOLVED_CONFLICT_BOOKINGS = CONFLICT_BOOKINGS.map(resolveConflict);
