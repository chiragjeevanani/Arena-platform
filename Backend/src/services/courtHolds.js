/**
 * Court holds — whole-arena bookings (kind 'arena') and events (kind 'event').
 * A hold takes some or all courts for one or more days, all day or between two times.
 * Customer bookings already in that window are not moved automatically: they are flagged
 * (booking.affectedBy) and listed on the hold; the admin moves each one by hand or refunds it,
 * and the customer may cancel it for a full refund.
 */
const ArenaDayBooking = require('../models/ArenaDayBooking');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const User = require('../models/User');
const RecurringBlock = require('../models/RecurringBlock');
const { appliesOn } = require('./courtBlocks');
const { arenaTodayYmd, slotRange, checkSlotBookable } = require('./slotAvailability');
const { createNotification } = require('./notificationService');

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const ACTIVE = ['confirmed', 'rescheduled'];
const MAX_DAYS = 30;
const err = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });
const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmt = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const toMin = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + m; };
/** [start, end) minutes of a hold's daily window; 00:00–00:00 = the whole day. */
const windowOf = (h) => { const s = toMin(h.startTime || '00:00'); let e = toMin(h.endTime || '00:00'); if (e <= s) e += 1440; return [s, e]; };
const endOf = (h) => h.endDate || h.date;
const isAllDay = (h) => (h.startTime || '00:00') === '00:00' && (h.endTime || '00:00') === '00:00';
const timeText = (h) => (isAllDay(h) ? 'all day' : `${h.startTime}–${h.endTime}`);
const dayText = (h) => (endOf(h) === h.date ? fmt(h.date) : `${fmt(h.date)} – ${fmt(endOf(h))}`);
const labelOf = (h) => (h.kind === 'event' ? `the event "${h.bookedFor}"` : `a private booking of the whole arena (${h.bookedFor})`);

/** Validates and normalises { date, days, allDay, startTime, endTime, courtIds } for an arena. */
async function normalize(arenaId, input, { allowPast = false } = {}) {
  const date = String(input.date || '');
  if (!YMD.test(date)) throw err(400, 'Choose the start date');
  if (!allowPast && date < arenaTodayYmd()) throw err(400, 'The date has already passed');
  if (date > addDays(arenaTodayYmd(), 730)) throw err(400, 'Choose a date within the next 2 years');
  const days = Math.round(Number(input.days || 1));
  if (!(days >= 1 && days <= MAX_DAYS)) throw err(400, `Number of days must be 1 to ${MAX_DAYS}`);
  let startTime = '00:00'; let endTime = '00:00';
  if (input.allDay === false || input.allDay === 'false') {
    startTime = String(input.startTime || ''); endTime = String(input.endTime || '');
    if (!HM.test(startTime) || !HM.test(endTime)) throw err(400, 'Choose the start and end time');
    if (endTime !== '00:00' && toMin(endTime) <= toMin(startTime)) throw err(400, 'The end time must be after the start time');
    if (startTime === '00:00' && endTime === '00:00') throw err(400, 'Choose the start and end time, or "All day"');
  }
  const arenaCourts = await Court.find({ arenaId, status: { $ne: 'inactive' } }).select('_id name').lean();
  let courtIds = [];
  if (Array.isArray(input.courtIds) && input.courtIds.length) {
    const valid = new Set(arenaCourts.map((c) => String(c._id)));
    courtIds = [...new Set(input.courtIds.map(String))].filter((id) => valid.has(id));
    if (!courtIds.length) throw err(400, 'Choose at least one court');
    if (courtIds.length === arenaCourts.length) courtIds = []; // every court = whole arena
  }
  return { date, endDate: addDays(date, days - 1), days, startTime, endTime, courtIds, arenaCourts };
}

const courtsOverlap = (a, b) => !a.length || !b.length || a.some((x) => b.includes(x));
const timesOverlap = (a, b) => { const [s1, e1] = windowOf(a); const [s2, e2] = windowOf(b); return s1 < e2 && e1 > s2; };

/** Other active holds that would take the same court at the same time. */
async function findClashingHolds(arenaId, n, excludeId = null) {
  const list = await ArenaDayBooking.find({
    arenaId, status: 'active', date: { $lte: n.endDate },
    $or: [{ endDate: { $gte: n.date } }, { endDate: null, date: { $gte: n.date } }],
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean();
  return list.filter((h) => courtsOverlap(n.courtIds, (h.courtIds || []).map(String)) && timesOverlap(n, h));
}

/** Customer bookings (and reserved players) inside the hold's courts, days and hours. */
async function findAffected(arenaId, n, { holdId = null } = {}) {
  const courtName = new Map(n.arenaCourts.map((c) => [String(c._id), c.name]));
  const q = { arenaId, date: { $gte: n.date, $lte: n.endDate }, status: { $in: ACTIVE } };
  if (n.courtIds.length) q.courtId = { $in: n.courtIds };
  const [ws, we] = windowOf(n);
  void holdId;
  const bookings = (await Booking.find(q).populate('userId', 'name email phone').lean()).filter((b) => {
    const [s, e] = slotRange(b.timeSlot);
    return s < we && e > ws;
  });
  const affected = bookings.map((b) => ({
    bookingId: b._id,
    userId: b.userId?._id || b.userId,
    customerName: b.userId?.name || b.userId?.email || 'Customer',
    customerPhone: b.userId?.phone || '',
    amount: Number(b.amount || 0),
    from: { courtId: String(b.courtId), courtName: courtName.get(String(b.courtId)) || 'Court', date: b.date, timeSlot: b.timeSlot },
    state: 'pending',
  })).sort((a, b) => (a.from.date + a.from.timeSlot).localeCompare(b.from.date + b.from.timeSlot));
  const reserved = [];
  const rbs = await RecurringBlock.find({ arenaId, isActive: true, startDate: { $lte: n.endDate }, endDate: { $gte: n.date } }).lean();
  for (const rb of rbs) {
    if (n.courtIds.length && !n.courtIds.includes(String(rb.courtId))) continue;
    if (!timesOverlap(n, rb)) continue;
    for (let d = n.date; d <= n.endDate; d = addDays(d, 1)) {
      if (appliesOn(rb, d)) reserved.push({ playerName: rb.playerName, teamName: rb.teamName || '', phone: rb.phone || '', courtName: courtName.get(String(rb.courtId)) || 'Court', date: d, time: `${rb.startTime}-${rb.endTime}` });
    }
  }
  return { affected, reserved };
}

function toPublic(h, courtNames = new Map()) {
  const today = arenaTodayYmd();
  const courts = (h.courtIds || []).map(String);
  return {
    id: String(h._id),
    kind: h.kind || 'arena',
    eventId: h.eventId ? String(h.eventId) : null,
    date: h.date,
    endDate: endOf(h),
    days: Math.round((new Date(`${endOf(h)}T12:00:00Z`) - new Date(`${h.date}T12:00:00Z`)) / 864e5) + 1,
    allDay: isAllDay(h),
    startTime: h.startTime || '00:00',
    endTime: h.endTime || '00:00',
    courtIds: courts,
    courtNames: courts.length ? courts.map((c) => courtNames.get(c) || 'Court') : ['All courts'],
    bookedFor: h.bookedFor,
    teamName: h.teamName || '',
    phone: h.phone || '',
    note: h.note || '',
    amount: h.amount || 0,
    status: h.status === 'cancelled' ? 'cancelled' : endOf(h) < today ? 'past' : 'upcoming',
    affected: (h.affected || []).map((a) => ({ ...a, bookingId: String(a.bookingId), userId: a.userId ? String(a.userId) : null })),
    pendingCount: (h.affected || []).filter((a) => a.state === 'pending').length,
    moved: h.moved || [],
    createdAt: h.createdAt,
  };
}

async function notifyAffected(hold, affected) {
  for (const a of affected) {
    try {
      await createNotification(a.userId, 'Your booking clashes with an event',
        `${a.from.courtName} on ${fmt(a.from.date)} at ${a.from.timeSlot} is now taken by ${labelOf(hold)}. The arena will move your booking to another time and let you know — or you can cancel it now in the app (Bookings → Details) for a full refund to your wallet.`,
        'warning', { kind: 'booking_affected', bookingId: String(a.bookingId), holdId: String(hold._id) });
    } catch (e) { /* courtesy */ }
  }
}

async function flagAffected(hold, affected) {
  if (!affected.length) return;
  await Booking.updateMany(
    { _id: { $in: affected.map((a) => a.bookingId) } },
    { $set: { affectedBy: { holdId: hold._id, kind: hold.kind || 'arena', label: hold.kind === 'event' ? `Event: ${hold.bookedFor}` : `Whole arena: ${hold.bookedFor}`, at: new Date() } } }
  );
}

/** Creates a hold. Without `confirm`, throws 409 { needsConfirm, affected, reserved } when bookings clash. */
async function createHold(arenaId, input, { kind = 'arena', eventId = null, by = null, confirm = false } = {}) {
  const n = await normalize(arenaId, input);
  const bookedFor = String(input.bookedFor || '').trim();
  if (!bookedFor) throw err(400, kind === 'event' ? 'Event name is required' : 'Enter who the arena is booked for');
  const clash = await findClashingHolds(arenaId, n);
  if (clash.length) throw err(409, `Those courts are already held then by ${clash[0].kind === 'event' ? `the event "${clash[0].bookedFor}"` : `${clash[0].bookedFor} (whole-arena booking)`} on ${dayText(clash[0])}.`);
  const found = await findAffected(arenaId, n);
  if ((found.affected.length || found.reserved.length) && !confirm) {
    throw err(409, 'Some courts already have bookings in that time', { needsConfirm: true, affected: found.affected.map(publicAffected), reserved: found.reserved });
  }
  const hold = await ArenaDayBooking.create({
    arenaId, kind, eventId, date: n.date, endDate: n.endDate, startTime: n.startTime, endTime: n.endTime, courtIds: n.courtIds,
    bookedFor, teamName: String(input.teamName || '').trim(), phone: String(input.phone || '').trim(), note: String(input.note || '').trim(),
    amount: Number(input.amount) || 0, affected: found.affected, createdBy: by,
  });
  await flagAffected(hold, found.affected);
  await notifyAffected(hold, found.affected);
  return { hold, reserved: found.reserved };
}

const publicAffected = (a) => ({ customerName: a.customerName, customerPhone: a.customerPhone, amount: a.amount, from: a.from });

/** Preview for the form: affected bookings, reserved players and clashing holds. */
async function previewHold(arenaId, input, excludeId = null) {
  const n = await normalize(arenaId, input);
  const clash = await findClashingHolds(arenaId, n, excludeId);
  const found = await findAffected(arenaId, n);
  return {
    date: n.date, endDate: n.endDate, startTime: n.startTime, endTime: n.endTime,
    clash: clash.length ? { bookedFor: clash[0].bookedFor, kind: clash[0].kind || 'arena', when: `${dayText(clash[0])}, ${timeText(clash[0])}` } : null,
    affected: found.affected.map(publicAffected), reserved: found.reserved,
  };
}

/** Releases a hold: pending affected bookings simply stay where they are. */
async function cancelHold(hold, by = null) {
  if (hold.status === 'cancelled') return hold;
  hold.status = 'cancelled'; hold.cancelledAt = new Date(); hold.cancelledBy = by;
  const pending = (hold.affected || []).filter((a) => a.state === 'pending');
  for (const a of pending) { a.state = 'released'; a.resolvedAt = new Date(); }
  await hold.save();
  if (pending.length) {
    await Booking.updateMany({ _id: { $in: pending.map((a) => a.bookingId) }, 'affectedBy.holdId': hold._id }, { $set: { affectedBy: null } });
    for (const a of pending) {
      try { await createNotification(a.userId, 'Your booking stays as it is', `Good news — ${labelOf(hold)} no longer uses ${a.from.courtName} on ${fmt(a.from.date)}. Your booking at ${a.from.timeSlot} stays as it is.`, 'success', { kind: 'booking_unaffected', bookingId: String(a.bookingId) }); } catch (e) { /* courtesy */ }
    }
  }
  return hold;
}

/**
 * Event edited: re-apply its schedule/courts. Bookings that no longer clash are released;
 * new clashes are added (flagged + notified). Events don't need confirmation.
 */
async function syncEventHold(event, by = null) {
  const info = event.eventInfo || {};
  const wantsHold = event.isPublished && info.holdArenaId && (info.courtIds || []).length && info.startDate;
  let hold = info.holdId ? await ArenaDayBooking.findById(info.holdId) : null;
  if (!wantsHold) {
    if (hold && hold.status === 'active') await cancelHold(hold, by);
    return null;
  }
  const input = { date: info.startDate, days: info.days || 1, allDay: info.allDay !== false, startTime: info.startTime, endTime: info.endTime, courtIds: (info.courtIds || []).map(String), bookedFor: event.title };
  const arenaId = info.holdArenaId;
  if (!hold || hold.status !== 'active' || String(hold.arenaId) !== String(arenaId)) {
    if (hold && hold.status === 'active') await cancelHold(hold, by);
    const { hold: created } = await createHold(arenaId, input, { kind: 'event', eventId: event._id, by, confirm: true });
    return created;
  }
  // update in place
  const n = await normalize(arenaId, input, { allowPast: true });
  const clash = await findClashingHolds(arenaId, n, hold._id);
  if (clash.length) throw err(409, `Those courts are already held then by ${clash[0].kind === 'event' ? `the event "${clash[0].bookedFor}"` : `${clash[0].bookedFor} (whole-arena booking)`} on ${dayText(clash[0])}.`);
  Object.assign(hold, { date: n.date, endDate: n.endDate, startTime: n.startTime, endTime: n.endTime, courtIds: n.courtIds, bookedFor: event.title });
  const found = await findAffected(arenaId, n, { holdId: hold._id });
  const nowIds = new Set(found.affected.map((a) => String(a.bookingId)));
  const released = [];
  for (const a of hold.affected) {
    if (a.state === 'pending' && !nowIds.has(String(a.bookingId))) { a.state = 'released'; a.resolvedAt = new Date(); released.push(a); }
  }
  const known = new Set(hold.affected.map((a) => String(a.bookingId)));
  const added = found.affected.filter((a) => !known.has(String(a.bookingId)));
  hold.affected.push(...added);
  await hold.save();
  if (released.length) await Booking.updateMany({ _id: { $in: released.map((a) => a.bookingId) } }, { $set: { affectedBy: null } });
  await flagAffected(hold, added);
  await notifyAffected(hold, added);
  return hold;
}

function findAffectedRow(hold, bookingId) {
  const a = (hold.affected || []).find((x) => String(x.bookingId) === String(bookingId));
  if (!a) throw err(404, 'This booking is not affected by this hold');
  if (a.state !== 'pending') throw err(409, 'This booking has already been handled');
  return a;
}

/** Admin moves an affected booking by hand to a free slot. */
async function moveAffected(hold, bookingId, { courtId, date, timeSlot }) {
  const a = findAffectedRow(hold, bookingId);
  const court = await Court.findOne({ _id: courtId, arenaId: hold.arenaId }).lean();
  if (!court) throw err(400, 'Choose a court of this arena');
  if (!YMD.test(String(date || '')) || date < arenaTodayYmd()) throw err(400, 'Choose today or a future date');
  const ok = await checkSlotBookable({ court, dateStr: date, timeSlot });
  if (!ok.ok) throw err(ok.status || 409, ok.error || 'That slot is not free');
  const b = await Booking.findOne({ _id: bookingId, status: { $in: ACTIVE } });
  if (!b) throw err(409, 'The booking was cancelled meanwhile');
  b.rescheduledFrom = { courtId: String(b.courtId), date: b.date, timeSlot: b.timeSlot };
  b.rescheduledAt = new Date(); b.rescheduleReason = hold.kind === 'event' ? 'event' : 'whole_arena_booked';
  b.courtId = court._id; b.date = date; b.timeSlot = timeSlot; b.affectedBy = null;
  try { await b.save(); } catch (e) { if (e?.code === 11000) throw err(409, 'Someone just booked that slot — choose another'); throw e; }
  a.state = 'moved'; a.resolvedAt = new Date(); a.to = { courtId: String(court._id), courtName: court.name, date, timeSlot };
  hold.markModified('affected'); await hold.save();
  try {
    await createNotification(a.userId, 'Your booking has been moved',
      `Because of ${labelOf(hold)}, your ${a.from.courtName} booking on ${fmt(a.from.date)} at ${a.from.timeSlot} has been moved to ${fmt(date)}, ${court.name} at ${timeSlot}. Contact the arena if this doesn't suit you — or cancel it in the app for a full refund.`,
      'warning', { kind: 'booking_rescheduled', bookingId: String(b._id) });
  } catch (e) { /* courtesy */ }
  return a;
}

/** Full refund of an affected booking to the wallet (by the admin, or by the customer from the app). */
async function refundAffected(hold, bookingId, { by = 'staff' } = {}) {
  const a = findAffectedRow(hold, bookingId);
  const { refundPaidBooking } = require('./refundService');
  const b = await Booking.findById(bookingId).lean();
  let amount = 0;
  if (b && ['paid', 'refunded'].includes(b.paymentStatus) && !b.refundedAt) {
    const out = await refundPaidBooking(bookingId, { method: 'wallet', by, reason: hold.kind === 'event' ? 'event_clash' : 'whole_arena_clash' });
    amount = out.refundedAmount;
  } else if (b && ACTIVE.includes(b.status)) {
    await Booking.updateOne({ _id: bookingId }, { $set: { status: 'cancelled', cancelledAt: new Date(), cancelledBy: by } });
  }
  await Booking.updateOne({ _id: bookingId }, { $set: { affectedBy: null } });
  a.state = by === 'customer' ? 'customer_refunded' : 'refunded'; a.resolvedAt = new Date();
  hold.markModified('affected'); await hold.save();
  try {
    await createNotification(a.userId, 'Booking cancelled and refunded',
      `Your ${a.from.courtName} booking on ${fmt(a.from.date)} at ${a.from.timeSlot} has been cancelled because of ${labelOf(hold)}.${amount ? ` OMR ${Number(amount).toFixed(3)} has been credited to your Arena Wallet.` : ''}`,
      'success', { kind: 'booking_refunded', bookingId: String(bookingId) });
  } catch (e) { /* courtesy */ }
  return { ...a.toObject?.() || a, refunded: amount };
}

async function courtNameMap(arenaId) {
  const cs = await Court.find({ arenaId }).select('name').lean();
  return new Map(cs.map((c) => [String(c._id), c.name]));
}

module.exports = {
  normalize, previewHold, createHold, cancelHold, syncEventHold, moveAffected, refundAffected,
  toPublic, courtNameMap, fmt, timeText, dayText,
};
