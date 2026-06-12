const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getUpcomingDates(membership, slot, limit = 8) {
  if (!slot?.courtSlot?.dayOfWeek) return [];
  const targetDay = DAY_MAP[slot.courtSlot.dayOfWeek];
  if (targetDay === undefined) return [];

  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(membership.expiresAt);

  const cursor = new Date(start);
  while (cursor <= end && dates.length < limit) {
    if (cursor.getDay() === targetDay) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

const membership = { expiresAt: '2026-12-28T23:59:59' };
const slot = { courtSlot: { dayOfWeek: 'Mon' } };

console.log("Upcoming dates (fixed):", getUpcomingDates(membership, slot));
