/**
 * Whole-arena day bookings: the arena admin / Super Admin marks every court of the arena as
 * booked for one client for a whole day (price agreed offline). Customer bookings already on
 * that day are moved to the next free day at the same time (same court first, then any court)
 * and the customer is notified.
 */
const ArenaDayBooking = require('../models/ArenaDayBooking');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const RecurringBlock = require('../models/RecurringBlock');
const { appliesOn } = require('../services/courtBlocks');
const { arenaTodayYmd, slotRange, findPublicCourtSlots, checkSlotBookable } = require('../services/slotAvailability');

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const SEARCH_DAYS = 30; // how far ahead to look for a free slot when moving a booking
const ACTIVE = ['confirmed', 'rescheduled'];
const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmt = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const sameRange = (a, b) => { const [s1, e1] = slotRange(a); const [s2, e2] = slotRange(b); return s1 === s2 && e1 === e2; };

function toPublic(ab, today) {
  return {
    id: String(ab._id),
    date: ab.date,
    bookedFor: ab.bookedFor,
    teamName: ab.teamName || '',
    phone: ab.phone || '',
    note: ab.note || '',
    amount: ab.amount || 0,
    status: ab.status === 'cancelled' ? 'cancelled' : ab.date < today ? 'past' : 'upcoming',
    moved: ab.moved || [],
    notMoved: ab.notMoved || [],
    createdAt: ab.createdAt,
  };
}

/** Courts of the arena, active first by name. */
async function arenaCourts(arenaId) {
  const courts = await Court.find({ arenaId, status: { $ne: 'inactive' } }).select('_id name arenaId status').lean();
  return courts.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
}

/**
 * For every active customer booking on `date`, the next free slot with the same start/end time:
 * same court first, then the other courts, on the following days (up to SEARCH_DAYS).
 */
async function planMoves(arenaId, date) {
  const courts = await arenaCourts(arenaId);
  const courtName = new Map(courts.map((c) => [String(c._id), c.name]));
  const bookings = await Booking.find({ arenaId, date, status: { $in: ACTIVE } }).populate('userId', 'name email phone').lean();
  const claimed = new Set(); // slots already given to another booking in this plan
  const moves = [];
  const unmovable = [];
  for (const b of bookings.sort((x, y) => slotRange(x.timeSlot)[0] - slotRange(y.timeSlot)[0])) {
    const from = { courtId: String(b.courtId), courtName: courtName.get(String(b.courtId)) || 'Court', date: b.date, timeSlot: b.timeSlot };
    const order = [courts.find((c) => String(c._id) === String(b.courtId)), ...courts.filter((c) => String(c._id) !== String(b.courtId))].filter(Boolean);
    let to = null;
    for (let n = 1; n <= SEARCH_DAYS && !to; n++) {
      const d = addDays(date, n);
      for (const court of order) {
        const match = (await findPublicCourtSlots(court, d)).find((s) => sameRange(s.timeSlot, b.timeSlot));
        if (!match) continue;
        const key = `${court._id}|${d}|${match.timeSlot}`;
        if (claimed.has(key)) continue;
        const ok = await checkSlotBookable({ court, dateStr: d, timeSlot: match.timeSlot });
        if (!ok.ok) continue;
        claimed.add(key);
        to = { courtId: String(court._id), courtName: court.name, date: d, timeSlot: match.timeSlot };
        break;
      }
    }
    const row = { bookingId: b._id, customerName: b.userId?.name || b.userId?.email || 'Customer', customerUserId: b.userId?._id || b.userId, from, to };
    (to ? moves : unmovable).push(row);
  }
  // Reserved slots (regular players) that fall on this day — shown so the admin can tell them.
  const reserved = (await RecurringBlock.find({ arenaId, isActive: true, startDate: { $lte: date }, endDate: { $gte: date } }).lean())
    .filter((rb) => appliesOn(rb, date))
    .map((rb) => ({ playerName: rb.playerName, teamName: rb.teamName || '', phone: rb.phone || '', courtName: courtName.get(String(rb.courtId)) || 'Court', time: `${rb.startTime}-${rb.endTime}` }));
  return { moves, unmovable, reserved };
}

const publicPlan = ({ moves, unmovable, reserved }) => ({
  moves: moves.map(({ customerName, from, to }) => ({ customerName, from, to })),
  unmovable: unmovable.map(({ customerName, from }) => ({ customerName, from })),
  reserved,
});

function validate(b, today) {
  if (!YMD.test(String(b.date || ''))) return 'Choose the date';
  if (b.date < today) return 'The date has already passed';
  if (b.date > addDays(today, 730)) return 'Choose a date within the next 2 years';
  if (!String(b.bookedFor || '').trim()) return 'Enter who the arena is booked for';
  if (b.amount !== undefined && b.amount !== '' && (!Number.isFinite(Number(b.amount)) || Number(b.amount) < 0)) return 'Amount must be 0 or more';
  return null;
}

/** GET /arena-admin/arena-bookings?status=upcoming|past|all */
async function listArenaBookings(req, res) {
  const today = arenaTodayYmd();
  const status = String(req.query.status || 'upcoming');
  const q = { arenaId: req.arenaScopeId };
  if (status === 'upcoming') Object.assign(q, { status: 'active', date: { $gte: today } });
  else if (status === 'past') q.$or = [{ status: 'cancelled' }, { date: { $lt: today } }];
  const list = await ArenaDayBooking.find(q).sort({ date: status === 'upcoming' ? 1 : -1 }).limit(200).lean();
  return res.json({ arenaBookings: list.map((ab) => toPublic(ab, today)) });
}

/** GET /arena-admin/arena-bookings/preview?date= — what booking the whole arena that day would change. */
async function previewArenaBooking(req, res) {
  const today = arenaTodayYmd();
  const date = String(req.query.date || '');
  if (!YMD.test(date) || date < today) return res.status(400).json({ error: 'Choose today or a future date' });
  const existing = await ArenaDayBooking.findOne({ arenaId: req.arenaScopeId, date, status: 'active' }).lean();
  if (existing) return res.json({ date, alreadyBooked: toPublic(existing, today), moves: [], unmovable: [], reserved: [] });
  return res.json({ date, ...publicPlan(await planMoves(req.arenaScopeId, date)) });
}

/**
 * POST /arena-admin/arena-bookings { date, bookedFor, teamName?, phone?, note?, amount?, confirm? }
 * Without confirm, returns 409 { needsConfirm, moves, unmovable, reserved } when bookings would be moved.
 */
async function createArenaBooking(req, res) {
  const today = arenaTodayYmd();
  const b = req.body || {};
  const err = validate(b, today);
  if (err) return res.status(400).json({ error: err });
  const arenaId = req.arenaScopeId;
  const taken = await ArenaDayBooking.findOne({ arenaId, date: b.date, status: 'active' }).lean();
  if (taken) return res.status(409).json({ error: `The whole arena is already booked on ${fmt(b.date)} for ${taken.bookedFor}.` });

  const plan = await planMoves(arenaId, b.date);
  if ((plan.moves.length || plan.unmovable.length || plan.reserved.length) && !b.confirm) {
    return res.status(409).json({ needsConfirm: true, error: 'Some courts already have bookings that day', ...publicPlan(plan) });
  }

  let ab;
  try {
    ab = await ArenaDayBooking.create({
      arenaId,
      date: b.date,
      bookedFor: String(b.bookedFor).trim(),
      teamName: String(b.teamName || '').trim(),
      phone: String(b.phone || '').trim(),
      note: String(b.note || '').trim(),
      amount: Number(b.amount) || 0,
      createdBy: req.auth?.sub || null,
    });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'The whole arena is already booked on that date.' });
    throw e;
  }

  // Move the customers' bookings (the arena is now blocked that day, so nobody can take those slots).
  const { createNotification } = require('../services/notificationService');
  const moved = [];
  const notMoved = plan.unmovable.map(({ customerName, from }) => ({ customerName, from }));
  for (const m of plan.moves) {
    let to = m.to;
    let ok = false;
    for (let attempt = 0; attempt < 2 && to && !ok; attempt++) {
      try {
        const r = await Booking.updateOne(
          { _id: m.bookingId, status: { $in: ACTIVE }, date: b.date },
          { $set: { courtId: to.courtId, date: to.date, timeSlot: to.timeSlot, rescheduledFrom: { courtId: m.from.courtId, date: m.from.date, timeSlot: m.from.timeSlot }, rescheduledAt: new Date(), rescheduleReason: 'whole_arena_booked' } }
        );
        ok = r.modifiedCount === 1;
        if (!ok) break; // cancelled or changed meanwhile — nothing to move
      } catch (e) {
        if (e?.code !== 11000) throw e;
        // someone booked that slot a moment ago: plan again for this booking
        const again = (await planMoves(arenaId, b.date)).moves.find((x) => String(x.bookingId) === String(m.bookingId));
        to = again?.to || null;
      }
    }
    if (ok) {
      moved.push({ bookingId: m.bookingId, customerName: m.customerName, from: m.from, to });
      try {
        await createNotification(
          m.customerUserId,
          'Your booking has been moved',
          `The arena is fully booked for a private event on ${fmt(m.from.date)}, so your ${m.from.courtName} booking at ${m.from.timeSlot} has been moved to ${fmt(to.date)}, ${to.courtName} at ${to.timeSlot}. Please contact the arena if this time doesn't suit you.`,
          'warning',
          { kind: 'booking_rescheduled', bookingId: String(m.bookingId) }
        );
      } catch (e) { /* notification failure must not undo the move */ }
    } else if (to === null) {
      notMoved.push({ customerName: m.customerName, from: m.from });
    }
  }
  ab.moved = moved;
  ab.notMoved = notMoved;
  await ab.save();
  return res.status(201).json({ arenaBooking: toPublic(ab.toObject(), today), reserved: plan.reserved });
}

/** POST /arena-admin/arena-bookings/:id/cancel — frees the day again (moved bookings stay where they are). */
async function cancelArenaBooking(req, res) {
  if (!/^[a-f0-9]{24}$/i.test(String(req.params.id))) return res.status(404).json({ error: 'Not found' });
  const ab = await ArenaDayBooking.findOne({ _id: req.params.id, arenaId: req.arenaScopeId });
  if (!ab) return res.status(404).json({ error: 'Not found' });
  if (ab.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });
  ab.status = 'cancelled';
  ab.cancelledAt = new Date();
  ab.cancelledBy = req.auth?.sub || null;
  await ab.save();
  return res.json({ arenaBooking: toPublic(ab.toObject(), arenaTodayYmd()) });
}

module.exports = { listArenaBookings, previewArenaBooking, createArenaBooking, cancelArenaBooking, planMoves };
