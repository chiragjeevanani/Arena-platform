/** Start hour 0–23 from API slot label e.g. `04:00 PM - 05:00 PM` */
export function slotStartHour24(timeSlot) {
  if (!timeSlot || typeof timeSlot !== 'string') return 12;
  const m = timeSlot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 12;
  let h = parseInt(m[1], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h;
}

/** Match legacy mock “prime” window (4pm–9pm). */
export function isPrimeTimeSlot(timeSlot) {
  const h = slotStartHour24(timeSlot);
  return h >= 16 && h <= 21;
}
