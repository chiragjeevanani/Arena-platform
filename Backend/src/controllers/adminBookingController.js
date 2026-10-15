const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Arena = require('../models/Arena');
const Court = require('../models/Court');
const { buildCourtSlotConflictQuery } = require('../utils/bookingQuery');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { refundPaidBooking } = require('../services/refundService');
const { refundBookingWallet } = require('../services/walletService');
const { createNotification } = require('../services/notificationService');

const ADMIN_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];

async function listAdminBookings(req, res) {
  const { arenaId, date } = req.query;
  const filter = {};
  if (arenaId && mongoose.isValidObjectId(arenaId)) {
    filter.arenaId = arenaId;
  }
  if (date && typeof date === 'string') {
    filter.date = date.trim();
  }

  const list = await Booking.find(filter).populate('userId', 'name phone').sort({ createdAt: -1 }).limit(200).lean();

  const out = await Promise.all(
    list.map(async (b) => {
      const [arena, court] = await Promise.all([
        Arena.findById(b.arenaId).lean(),
        Court.findById(b.courtId).lean(),
      ]);
      return Booking.toPublic(b, {
        arenaName: arena?.name || '',
        courtName: court?.name || '',
        arenaImage: arena?.image || '',
        location: arena?.location || '',
        userName: b.userId?.name || 'Unknown',
        userPhone: b.userId?.phone || '',
      });
    })
  );

  return res.json({ bookings: out });
}

async function updateAdminBooking(req, res) {
  const { bookingId } = req.params;
  const { status, date, timeSlot, amount, paymentStatus } = req.body;

  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Update status if provided
  if (status) {
    if (!ADMIN_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ADMIN_STATUSES.join(', ')}` });
    }
    booking.status = status;
  }

  // Update date/time if provided (Rescheduling)
  if (date || timeSlot) {
    const finalDate = date || booking.date;
    const finalSlot = timeSlot || booking.timeSlot;

    // Check for conflict if moving to a new slot
    if (finalDate !== booking.date || finalSlot !== booking.timeSlot) {
      const conflict = await Booking.findOne(buildCourtSlotConflictQuery({
        excludeBookingId: bookingId,
        courtId: booking.courtId,
        date: finalDate,
        timeSlot: finalSlot,
      }));
      if (conflict) {
        return res.status(409).json({ error: 'This target slot is already booked' });
      }
    }

    if (date) booking.date = date;
    if (timeSlot) booking.timeSlot = timeSlot;
  }

  if (amount !== undefined) booking.amount = Number(amount);
  if (paymentStatus) {
    // "Refunded" must mean money actually went back — use the refund endpoint for that.
    if (paymentStatus === 'refunded' && booking.paymentStatus !== 'refunded') {
      return res.status(400).json({ error: 'Use the refund action to refund a booking' });
    }
    booking.paymentStatus = paymentStatus;
  }

  const becameCancelled = booking.isModified('status') && booking.status === 'cancelled';
  if (becameCancelled) {
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'staff';
    // An unpaid checkout cancelled by staff: release the slot payment state too.
    if (booking.paymentStatus === 'pending') booking.paymentStatus = 'cancelled';
  }

  await booking.save();

  // Wallet money held by an unpaid booking goes back. Paid bookings are refunded
  // explicitly by staff with the refund action (full refund or record a bank refund).
  if (becameCancelled && booking.paymentStatus !== 'paid') {
    await refundBookingWallet(booking, 'staff_cancel');
  }

  const [arena, court, userDoc] = await Promise.all([
    Arena.findById(booking.arenaId).lean(),
    Court.findById(booking.courtId).lean(),
    mongoose.model('User').findById(booking.userId).lean(),
  ]);

  return res.json({
    booking: Booking.toPublic(booking, {
      arenaName: arena?.name || '',
      courtName: court?.name || '',
      arenaImage: arena?.image || '',
      location: arena?.location || '',
      userName: userDoc?.name || 'Unknown',
      userPhone: userDoc?.phone || '',
    }),
  });
}

/**
 * POST /admin/bookings/:bookingId/refund  { method: 'wallet' | 'bank', reference?, note? }
 * Full refund of a paid booking (also cancels it). 'wallet' credits the customer's Arena
 * Wallet; 'bank' records a refund made in the Bank Muscat merchant portal.
 */
async function refundAdminBooking(req, res) {
  const { bookingId } = req.params;
  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }
  const method = req.body?.method === 'bank' ? 'bank' : 'wallet';
  const reference = req.body?.reference ? String(req.body.reference).trim() : '';
  if (method === 'bank' && !reference) {
    return res.status(400).json({ error: 'Enter the bank refund reference' });
  }

  const { booking, refundedAmount } = await refundPaidBooking(bookingId, {
    method,
    reference,
    by: 'staff',
    reason: 'staff_refund',
  });

  // If this booking was flagged on a gateway payment as needing a manual refund, clear it.
  await markConflictResolved(booking._id, { method, reference, by: req.auth.sub });

  await createNotification(
    booking.userId,
    'Booking Refunded',
    method === 'wallet'
      ? `OMR ${refundedAmount.toFixed(3)} for your booking on ${booking.date} has been credited to your Arena Wallet.`
      : `Your booking on ${booking.date} has been refunded to your card (ref ${reference}). Banks can take several working days to show it.`,
    'success',
    { bookingId: booking._id.toString() }
  );

  const [arena, court, userDoc] = await Promise.all([
    Arena.findById(booking.arenaId).lean(),
    Court.findById(booking.courtId).lean(),
    User.findById(booking.userId).lean(),
  ]);
  return res.json({
    booking: Booking.toPublic(booking, {
      arenaName: arena?.name || '',
      courtName: court?.name || '',
      userName: userDoc?.name || 'Unknown',
      userPhone: userDoc?.phone || '',
    }),
    refundedAmount,
  });
}

/** Clears a booking from its payment's "needs manual refund" list once refunded. */
async function markConflictResolved(bookingId, { method, reference, by }) {
  const id = String(bookingId);
  const payment = await Payment.findOne({ 'meta.needsManualRefund': true, 'meta.conflictedBookingIds': id });
  if (!payment) return;
  const resolved = [...new Set([...(payment.meta.refundResolvedBookingIds || []), id])];
  const allDone = (payment.meta.conflictedBookingIds || []).every((b) => resolved.includes(String(b)));
  await Payment.updateOne(
    { _id: payment._id },
    {
      $set: {
        'meta.refundResolvedBookingIds': resolved,
        'meta.needsManualRefund': !allDone,
        ...(allDone ? { 'meta.refundResolvedAt': new Date().toISOString(), 'meta.refundResolvedBy': String(by) } : {}),
        'meta.lastRefundMethod': method,
        ...(reference ? { 'meta.lastRefundReference': reference } : {}),
      },
    }
  );
}

/**
 * GET /admin/refunds — gateway payments that were captured but whose booking lost the slot
 * (or couldn't be confirmed) and still need the customer refunded.
 */
async function listManualRefunds(req, res) {
  const payments = await Payment.find({ 'meta.needsManualRefund': true }).sort({ createdAt: -1 }).limit(200).lean();
  const bookingIds = payments.flatMap((p) => (p.meta.conflictedBookingIds || []).map(String));
  const bookings = await Booking.find({ _id: { $in: bookingIds } }).lean();
  const filtered = req.arenaScopeId ? bookings.filter((b) => String(b.arenaId) === req.arenaScopeId) : bookings;
  const byId = new Map(filtered.map((b) => [String(b._id), b]));

  const [users, arenas, courts] = await Promise.all([
    User.find({ _id: { $in: [...new Set(filtered.map((b) => String(b.userId)))] } }).select('name email phone').lean(),
    Arena.find({ _id: { $in: [...new Set(filtered.map((b) => String(b.arenaId)))] } }).select('name').lean(),
    Court.find({ _id: { $in: [...new Set(filtered.map((b) => String(b.courtId)))] } }).select('name').lean(),
  ]);
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const arenaById = new Map(arenas.map((a) => [String(a._id), a]));
  const courtById = new Map(courts.map((c) => [String(c._id), c]));

  const items = [];
  for (const p of payments) {
    const resolved = new Set((p.meta.refundResolvedBookingIds || []).map(String));
    for (const id of (p.meta.conflictedBookingIds || []).map(String)) {
      const b = byId.get(id);
      if (!b || resolved.has(id) || b.refundedAt) continue;
      const u = userById.get(String(b.userId));
      items.push({
        bookingId: id,
        paymentId: String(p._id),
        paymentReference: p.providerTransactionId || p.merchantTransactionReference || String(p._id),
        paidAt: p.completedAt || p.updatedAt,
        customerName: u?.name || 'Unknown',
        customerEmail: u?.email || '',
        customerPhone: u?.phone || '',
        arenaName: arenaById.get(String(b.arenaId))?.name || '',
        courtName: courtById.get(String(b.courtId))?.name || '',
        date: b.date,
        timeSlot: b.timeSlot,
        amount: b.amount,
        cardAmount: Math.max(0, Math.round(((b.amount || 0) - (b.walletUsed || 0)) * 1000) / 1000),
        walletAmount: b.walletUsed || 0,
        reason: 'Slot was taken by another customer before this payment completed',
      });
    }
  }
  return res.json({ refunds: items });
}

module.exports = { listAdminBookings, updateAdminBooking, refundAdminBooking, listManualRefunds };
