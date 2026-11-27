/**
 * Whole-arena bookings and event court holds (Arena Panel / Super Admin → Whole-Arena Booking).
 * The arena admin books every court for one or more days (all day or between two times); events
 * hold the courts chosen on the event. Bookings already in that time are listed as "affected":
 * the admin moves each one by hand or refunds it; the customer can cancel for a full refund.
 */
const mongoose = require('mongoose');
const ArenaDayBooking = require('../models/ArenaDayBooking');
const holds = require('../services/courtHolds');
const { arenaTodayYmd } = require('../services/slotAvailability');

const inputFrom = (src) => ({
  date: src.date,
  days: src.days,
  allDay: src.allDay === undefined ? true : !(src.allDay === false || src.allDay === 'false'),
  startTime: src.startTime,
  endTime: src.endTime,
  courtIds: [], // whole arena
  bookedFor: src.bookedFor,
  teamName: src.teamName,
  phone: src.phone,
  note: src.note,
  amount: src.amount,
});

async function holdInScope(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(404).json({ error: 'Not found' }); return null; }
  const hold = await ArenaDayBooking.findOne({ _id: req.params.id, arenaId: req.arenaScopeId });
  if (!hold) { res.status(404).json({ error: 'Not found' }); return null; }
  return hold;
}

/** GET /arena-admin/arena-bookings?status=upcoming|past|all&kind=arena|event|all */
async function listArenaBookings(req, res) {
  const today = arenaTodayYmd();
  const status = String(req.query.status || 'upcoming');
  const kind = String(req.query.kind || 'all');
  const q = { arenaId: req.arenaScopeId };
  if (kind === 'arena') q.kind = { $in: ['arena', null] };
  if (kind === 'event') q.kind = 'event';
  if (status === 'upcoming') Object.assign(q, { status: 'active', $or: [{ endDate: { $gte: today } }, { endDate: null, date: { $gte: today } }] });
  else if (status === 'past') q.$and = [{ $or: [{ status: 'cancelled' }, { endDate: { $lt: today } }, { endDate: null, date: { $lt: today } }] }];
  const list = await ArenaDayBooking.find(q).sort({ date: status === 'upcoming' ? 1 : -1 }).limit(200).lean();
  const names = await holds.courtNameMap(req.arenaScopeId);
  return res.json({ arenaBookings: list.map((h) => holds.toPublic(h, names)) });
}

/** GET /arena-admin/arena-bookings/preview?date=&days=&allDay=&startTime=&endTime= */
async function previewArenaBooking(req, res) {
  const out = await holds.previewHold(req.arenaScopeId, inputFrom(req.query));
  return res.json(out);
}

/** POST /arena-admin/arena-bookings { date, days, allDay, startTime, endTime, bookedFor, …, confirm } */
async function createArenaBooking(req, res) {
  const b = req.body || {};
  if (b.amount !== undefined && b.amount !== '' && (!Number.isFinite(Number(b.amount)) || Number(b.amount) < 0)) return res.status(400).json({ error: 'Amount must be 0 or more' });
  try {
    const { hold, reserved } = await holds.createHold(req.arenaScopeId, inputFrom(b), { kind: 'arena', by: req.auth?.sub || null, confirm: !!b.confirm });
    const names = await holds.courtNameMap(req.arenaScopeId);
    return res.status(201).json({ arenaBooking: holds.toPublic(hold.toObject(), names), reserved });
  } catch (e) {
    if (e.needsConfirm) return res.status(409).json({ needsConfirm: true, error: e.message, affected: e.affected, reserved: e.reserved });
    throw e;
  }
}

/** POST /arena-admin/arena-bookings/:id/cancel — frees the courts; affected bookings stay where they are. */
async function cancelArenaBooking(req, res) {
  const hold = await holdInScope(req, res); if (!hold) return;
  if (hold.kind === 'event') return res.status(400).json({ error: 'This is an event — change its courts or dates in Event Management.' });
  if (hold.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });
  await holds.cancelHold(hold, req.auth?.sub || null);
  const names = await holds.courtNameMap(req.arenaScopeId);
  return res.json({ arenaBooking: holds.toPublic(hold.toObject(), names) });
}

/** POST /arena-admin/arena-bookings/:id/affected/:bookingId/move { courtId, date, timeSlot } */
async function moveAffectedBooking(req, res) {
  const hold = await holdInScope(req, res); if (!hold) return;
  const a = await holds.moveAffected(hold, req.params.bookingId, req.body || {});
  return res.json({ affected: { ...(a.toObject ? a.toObject() : a), bookingId: String(a.bookingId) } });
}

/** POST /arena-admin/arena-bookings/:id/affected/:bookingId/refund — full refund to the wallet + cancel. */
async function refundAffectedBooking(req, res) {
  const hold = await holdInScope(req, res); if (!hold) return;
  const out = await holds.refundAffected(hold, req.params.bookingId, { by: 'staff' });
  return res.json({ affected: { state: out.state, refunded: out.refunded } });
}

module.exports = { listArenaBookings, previewArenaBooking, createArenaBooking, cancelArenaBooking, moveAffectedBooking, refundAffectedBooking };
