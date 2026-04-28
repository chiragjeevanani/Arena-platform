const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Arena = require('../models/Arena');
const CourtSlot = require('../models/CourtSlot');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const User = require('../models/User');

// Helper to convert time string to minutes for comparison
const timeToMins = (t) => {
  if (!t) return 0;
  const parts = t.trim().split(' ');
  const [h, m] = parts[0].split(':').map(Number);
  let fh = h;
  if (parts[1]) {
    if (parts[1].toUpperCase() === 'PM' && h !== 12) fh += 12;
    if (parts[1].toUpperCase() === 'AM' && h === 12) fh = 0;
  }
  return fh * 60 + (m || 0);
};

/**
 * GET /api/arena-admin/walkin/courts
 * Returns active courts for this arena (scoped to staff's arena)
 */
async function getWalkinCourts(req, res) {
  const courts = await Court.find({ arenaId: req.arenaScopeId, status: 'active' })
    .select('_id name type pricePerHour')
    .lean();

  return res.json({
    courts: courts.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      type: c.type,
      pricePerHour: c.pricePerHour,
    })),
  });
}

/**
 * GET /api/arena-admin/walkin/slots?courtId=&date=
 * Returns available slots for a specific court on a specific date
 */
async function getWalkinSlots(req, res) {
  const { courtId, date } = req.query;

  if (!courtId || !mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'courtId is required' });
  }
  if (!date) {
    return res.status(400).json({ error: 'date (YYYY-MM-DD) is required' });
  }

  // Verify court belongs to this arena
  const court = await Court.findOne({ _id: courtId, arenaId: req.arenaScopeId }).lean();
  if (!court) return res.status(404).json({ error: 'Court not found in your arena' });

  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

  // Get configured slots for this court/day
  const configuredSlots = await CourtSlot.find({
    arenaId: req.arenaScopeId,
    courtId: String(courtId),
    dayOfWeek,
    isActive: true,
  }).sort({ startTime: 1 }).lean();

  let baseSlots = [];
  if (configuredSlots.length > 0) {
    baseSlots = configuredSlots.map((s) => ({
      timeSlot: s.timeSlot,
      price: s.price ?? court.pricePerHour ?? 0,
    }));
  } else {
    // Fallback: standard slots
    const hours = ['06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM',
                   '12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM',
                   '06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM'];
    baseSlots = hours.map((t) => ({ timeSlot: `${t} - ${hours[hours.indexOf(t) + 1] || '11:00 PM'}`, price: court.pricePerHour ?? 0 }));
  }

  // Get booked slots
  const bookings = await Booking.find({
    courtId,
    date,
    status: { $in: ['pending', 'confirmed'] },
  }).select('timeSlot').lean();

  const bookedSet = new Set(bookings.map((b) => b.timeSlot));

  // Get blocks
  const blocks = await AvailabilityBlock.find({ courtId, date }).lean();

  const slots = baseSlots.map((s) => {
    const sStart = timeToMins(s.timeSlot.split(' - ')[0]);
    const sEnd = timeToMins(s.timeSlot.split(' - ')[1]);
    const isBlocked = blocks.some((b) => {
      const bStart = timeToMins(b.startTime);
      const bEnd = timeToMins(b.endTime);
      return sStart < bEnd && sEnd > bStart;
    });
    return {
      timeSlot: s.timeSlot,
      price: s.price,
      available: !bookedSet.has(s.timeSlot) && !isBlocked,
      isBooked: bookedSet.has(s.timeSlot),
      isBlocked,
    };
  });

  return res.json({ courtId, date, slots });
}

/**
 * GET /api/arena-admin/walkin/customers/search?q=
 * Searches for existing users by name, email, or phone
 */
async function searchWalkinCustomers(req, res) {
  const { q } = req.query;
  const query = String(q || '').trim();
  let users;

  if (query.length < 2) {
    // Return 10 most recent users if no query
    users = await User.find().sort({ createdAt: -1 }).limit(10).lean();
  } else {
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    })
    .limit(10)
    .lean();
  }

  return res.json({
    customers: users.map(u => User.toPublic(u))
  });
}

/**
 * POST /api/arena-admin/walkin/customers
 * Quickly registers a new customer
 */
async function createWalkinCustomer(req, res) {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  // Generate a random password for walk-in users (they can reset it later)
  const randomPass = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(randomPass, 10);

  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone ? phone.trim() : '',
    passwordHash,
    role: 'CUSTOMER',
    isEmailVerified: true, // Auto-verify walk-in users since they are physically present
  });

  return res.status(201).json({
    customer: User.toPublic(newUser)
  });
}

/**
 * POST /api/arena-admin/walkin/book
 * Creates a walk-in booking on behalf of a customer
 * Body: { courtId, date, timeSlot, customerId, paymentMethod, amount }
 */
async function createWalkinBooking(req, res) {
  const {
    courtId,
    date,
    timeSlot,
    customerId,
    paymentMethod = 'cash',
    amount,
  } = req.body;

  if (!courtId || !date || !timeSlot || !customerId) {
    return res.status(400).json({
      error: 'courtId, date, timeSlot, and customerId are required',
    });
  }

  if (!mongoose.isValidObjectId(courtId) || !mongoose.isValidObjectId(customerId)) {
    return res.status(400).json({ error: 'Invalid courtId or customerId' });
  }

  // Verify customer exists
  const customer = await User.findById(customerId);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  // Verify court is in this arena
  const court = await Court.findOne({ _id: courtId, arenaId: req.arenaScopeId }).lean();
  if (!court) return res.status(404).json({ error: 'Court not found in your arena' });

  // Check for conflict
  const conflict = await Booking.findOne({
    courtId,
    date,
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) {
    return res.status(409).json({ error: 'This slot is already booked' });
  }

  const staffUserId = req.auth.sub;

  const booking = await Booking.create({
    userId: customerId,
    bookedBy: staffUserId,
    arenaId: req.arenaScopeId,
    courtId,
    date,
    timeSlot,
    status: 'confirmed',
    paymentStatus: paymentMethod === 'cash' || paymentMethod === 'card' ? 'paid' : 'pending',
    paymentMethod,
    amount: Number(amount) || 0,
    type: 'walkin',
  });

  const arena = await Arena.findById(req.arenaScopeId).lean();

  return res.status(201).json({
    booking: {
      id: booking._id.toString(),
      customerName: customer.name,
      customerPhone: customer.phone || '',
      customerEmail: customer.email,
      courtName: court.name,
      arenaName: arena?.name || '',
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      type: 'walkin',
      createdAt: booking.createdAt,
    },
  });
}

module.exports = { 
  getWalkinCourts, 
  getWalkinSlots, 
  createWalkinBooking,
  searchWalkinCustomers,
  createWalkinCustomer
};
