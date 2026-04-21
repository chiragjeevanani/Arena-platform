/** Pure date helpers + conflict resolution (no mock bookings). */

export const parseDate = (str) => new Date(`${str}T00:00:00`);

export const formatDate = (date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const dateRange = (start, end) => {
  const dates = [];
  let cur = new Date(start);
  const endD = new Date(end);
  while (cur <= endD) {
    dates.push(cur.toISOString().split('T')[0]);
    cur = addDays(cur, 1);
  }
  return dates;
};

export const overlapDays = (aStart, aEnd, bStart, bEnd) => {
  const a = dateRange(aStart, aEnd);
  const b = new Set(dateRange(bStart, bEnd));
  return a.filter((d) => b.has(d)).length;
};

/**
 * Augment a booking that has startDate, originalEndDate, and event date range.
 * Used by the conflicts tab when real conflict data exists.
 */
export const resolveConflict = (booking) => {
  const { startDate, originalEndDate, event } = booking;
  if (!event?.startDate || !event?.endDate) {
    return {
      ...booking,
      overlappingDays: 0,
      finalEndDate: originalEndDate,
      classifyDate: () => 'none',
      fmtStart: formatDate(parseDate(startDate)),
      fmtOrigEnd: formatDate(parseDate(originalEndDate)),
      fmtFinalEnd: formatDate(parseDate(originalEndDate)),
      fmtEventStart: '',
      fmtEventEnd: '',
    };
  }

  const blocked = overlapDays(startDate, originalEndDate, event.startDate, event.endDate);
  const finalEnd = addDays(new Date(originalEndDate), blocked);
  const finalEndStr = finalEnd.toISOString().split('T')[0];

  const bookedDates = new Set(dateRange(startDate, originalEndDate));
  const eventDates = new Set(dateRange(event.startDate, event.endDate));
  const extendedDates = new Set(
    dateRange(addDays(new Date(originalEndDate), 1).toISOString().split('T')[0], finalEndStr)
  );

  const classifyDate = (dateStr) => {
    const inBooked = bookedDates.has(dateStr);
    const inEvent = eventDates.has(dateStr);
    const inExtended = extendedDates.has(dateStr);
    if (inBooked && inEvent) return 'overlap';
    if (inEvent && !inBooked) return 'event';
    if (inBooked) return 'booked';
    if (inExtended) return 'extended';
    return 'none';
  };

  return {
    ...booking,
    overlappingDays: blocked,
    finalEndDate: finalEndStr,
    classifyDate,
    fmtStart: formatDate(parseDate(startDate)),
    fmtOrigEnd: formatDate(parseDate(originalEndDate)),
    fmtFinalEnd: formatDate(finalEnd),
    fmtEventStart: formatDate(parseDate(event.startDate)),
    fmtEventEnd: formatDate(parseDate(event.endDate)),
  };
};
