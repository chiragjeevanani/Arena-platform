/**
 * Standard hourly display slots (6:00 AM → 10:00 PM) for availability UI.
 * @returns {{ timeSlot: string }[]}
 */
function getStandardDaySlots() {
  const slots = [];
  for (let h = 6; h <= 21; h += 1) {
    const start = format12(h);
    const end = format12(h + 1);
    slots.push({ timeSlot: `${start} - ${end}` });
  }
  return slots;
}

function format12(hour24) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let h = hour24 % 12;
  if (h === 0) h = 12;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:00 ${period}`;
}

module.exports = { getStandardDaySlots };
