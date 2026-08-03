/** Start hour 0–23 from API slot label e.g. `04:00 PM - 05:00 PM` or `16:00 - 17:00` */
export function slotStartHourAndMinute(timeSlot) {
  if (!timeSlot || typeof timeSlot !== 'string') return null;
  const str = timeSlot.trim();
  const m12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const m = parseInt(m12[2], 10);
    const ap = m12[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return { hour: h, minute: m };
  }
  const m24 = str.match(/^(\d{1,2}):(\d{2})/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const m = parseInt(m24[2], 10);
    return { hour: h, minute: m };
  }
  return null;
}

export function slotStartHour24(timeSlot) {
  const hm = slotStartHourAndMinute(timeSlot);
  return hm ? hm.hour : 12;
}

/** Match legacy mock “prime” window (4pm–9pm). */
export function isPrimeTimeSlot(timeSlot) {
  const h = slotStartHour24(timeSlot);
  return h >= 16 && h <= 21;
}

export function parseSlotStartDateTime(dateInput, timeSlot) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const hm = slotStartHourAndMinute(timeSlot);
  if (!hm) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hm.hour, hm.minute, 0, 0);
}

export function isSlotTimePassed(dateInput, timeSlot, referenceTime = new Date()) {
  const slotDate = parseSlotStartDateTime(dateInput, timeSlot);
  if (!slotDate) return false;
  return slotDate.getTime() <= referenceTime.getTime();
}
