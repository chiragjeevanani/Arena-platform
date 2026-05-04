const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Arena = require('../models/Arena');
const Court = require('../models/Court');

const ADMIN_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

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
      const conflict = await Booking.findOne({
        _id: { $ne: bookingId },
        courtId: booking.courtId,
        date: finalDate,
        timeSlot: finalSlot,
        status: { $in: ['pending', 'confirmed'] },
      });
      if (conflict) {
        return res.status(409).json({ error: 'This target slot is already booked' });
      }
    }

    if (date) booking.date = date;
    if (timeSlot) booking.timeSlot = timeSlot;
  }

  if (amount !== undefined) booking.amount = Number(amount);
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  await booking.save();

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

module.exports = { listAdminBookings, updateAdminBooking };
