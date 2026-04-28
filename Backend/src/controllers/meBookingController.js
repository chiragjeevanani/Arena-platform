const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Arena = require('../models/Arena');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { getOrCreateWallet } = require('../services/walletService');
const { computeCourtBookingPrice, amountsMatch } = require('../services/pricing');

async function createMyBooking(req, res) {
  const { arenaId, courtId, date, timeSlot, amount, paymentMethod } = req.body;

  if (!arenaId || !courtId || !date || !timeSlot) {
    return res.status(400).json({ error: 'arenaId, courtId, date, and timeSlot are required' });
  }

  if (!mongoose.isValidObjectId(arenaId) || !mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid arena or court id' });
  }

  const court = await Court.findById(courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }

  if (court.arenaId.toString() !== arenaId) {
    return res.status(400).json({ error: 'Court does not belong to this arena' });
  }

  const arena = await Arena.findById(arenaId);
  if (!arena || !arena.isPublished) {
    return res.status(404).json({ error: 'Arena not found' });
  }

  const userId = req.auth.sub;
  const pricing = await computeCourtBookingPrice(userId, arena);

  if (!amountsMatch(amount, pricing.finalAmount)) {
    return res.status(400).json({
      error: 'Amount does not match server pricing',
      pricing,
    });
  }

  const finalAmount = pricing.finalAmount;
  const method = paymentMethod || 'online';

  let walletDebit = null;
  if (method === 'wallet') {
    const wallet = await getOrCreateWallet(userId);
    const updated = await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: finalAmount } },
      { $inc: { balance: -finalAmount } },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ error: 'Insufficient wallet balance', pricing });
    }
    walletDebit = { walletId: wallet._id, balanceAfter: updated.balance };
  }

  try {
    const booking = await Booking.create({
      userId,
      arenaId,
      courtId,
      date: String(date).trim(),
      timeSlot: String(timeSlot).trim(),
      amount: finalAmount,
      paymentMethod: method,
      paymentStatus: method === 'wallet' ? 'paid' : 'pending',
      status: 'confirmed',
    });

    if (walletDebit) {
      await WalletTransaction.create({
        walletId: walletDebit.walletId,
        userId,
        type: 'debit',
        amount: finalAmount,
        reason: 'booking_payment',
        balanceAfter: walletDebit.balanceAfter,
        meta: {
          bookingId: booking._id.toString(),
          arenaId: String(arenaId),
          courtId: String(courtId),
        },
      });
    }

    return res.status(201).json({
      booking: Booking.toPublic(booking, {
        arenaName: arena.name,
        courtName: court.name,
      }),
      pricing,
    });
  } catch (err) {
    if (err.code === 11000) {
      if (walletDebit) {
        await Wallet.findByIdAndUpdate(walletDebit.walletId, { $inc: { balance: finalAmount } });
        const refunded = await Wallet.findById(walletDebit.walletId);
        await WalletTransaction.create({
          walletId: walletDebit.walletId,
          userId,
          type: 'credit',
          amount: finalAmount,
          reason: 'refund',
          balanceAfter: refunded.balance,
          meta: { reason: 'booking_slot_conflict' },
        });
      }
      return res.status(409).json({ error: 'This time slot is already booked' });
    }
    throw err;
  }
}

async function listMyBookings(req, res) {
  const list = await Booking.find({ userId: req.auth.sub })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const out = await Promise.all(
    list.map(async (b) => {
      const [arena, court] = await Promise.all([
        Arena.findById(b.arenaId).lean(),
        Court.findById(b.courtId).lean(),
      ]);
      return Booking.toPublic(b, {
        arenaName: arena?.name || '',
        courtName: court?.name || '',
      });
    })
  );

  return res.json({ bookings: out });
}

async function cancelMyBooking(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }

  const booking = await Booking.findOne({
    _id: id,
    userId: req.auth.sub,
  });
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking is already cancelled' });
  }

  const refundAmount =
    booking.paymentMethod === 'wallet' && booking.amount > 0 ? booking.amount : 0;

  booking.status = 'cancelled';
  if (refundAmount > 0) {
    booking.paymentStatus = 'refunded';
  }
  await booking.save();

  if (refundAmount > 0) {
    const wallet = await getOrCreateWallet(req.auth.sub);
    const updated = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: refundAmount } },
      { new: true }
    );
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.auth.sub,
      type: 'credit',
      amount: refundAmount,
      reason: 'refund',
      balanceAfter: updated.balance,
      meta: {
        bookingId: booking._id.toString(),
        reason: 'booking_cancel',
      },
    });
  }

  const arena = await Arena.findById(booking.arenaId).lean();
  const court = await Court.findById(booking.courtId).lean();

  return res.json({
    booking: Booking.toPublic(booking, {
      arenaName: arena?.name || '',
      courtName: court?.name || '',
    }),
  });
}

async function computeBookingPricing(req, res) {
  const { arenaId } = req.body;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'Invalid arenaId' });
  }
  const arena = await Arena.findById(arenaId);
  if (!arena) return res.status(404).json({ error: 'Arena not found' });

  const pricing = await computeCourtBookingPrice(req.auth.sub, arena, 'booking');
  return res.json({ pricing });
}

module.exports = { createMyBooking, listMyBookings, cancelMyBooking, computeBookingPricing };
