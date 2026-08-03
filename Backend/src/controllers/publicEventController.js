const EventRegistration = require('../models/EventRegistration');
const CmsContent = require('../models/CmsContent');
const { asyncHandler } = require('../utils/asyncHandler');

const { deductFromWallet } = require('../services/walletService');

const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId, name, phone, paymentMethod, amount } = req.body;

  if (!eventId || !name || !phone) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  const userId = req.auth?.sub;

  // Handle Wallet Deduction
  if (paymentMethod === 'wallet' && userId) {
    const payAmount = Number(amount || 0);
    if (payAmount > 0) {
      await deductFromWallet(userId, payAmount, 'event_registration', { eventId });
    }
  }

  // Verify event exists
  const event = await CmsContent.findById(eventId);
  if (!event || event.kind !== 'event') {
    return res.status(404).json({ error: 'Event not found or invalid' });
  }

  const cleanPhone = String(phone).trim();
  const cleanName = String(name).trim();
  const isFree = event.price ? String(event.price).toLowerCase().includes('free') : false;

  const targetStatus = (paymentMethod === 'wallet' || paymentMethod === 'cash' || isFree)
    ? 'Approved'
    : 'PAYMENT_PENDING';

  // Conditional Capacity Check (only if capacity or maxParticipants is defined)
  const maxCap = Number(event.capacity || event.maxParticipants || 0);
  if (maxCap > 0) {
    const activeCount = await EventRegistration.countDocuments({
      eventId,
      status: { $in: ['Approved', 'APPROVED', 'PAYMENT_PENDING', 'Pending'] },
      phone: { $ne: cleanPhone }, // Exclude current user if re-trying
    });
    if (activeCount >= maxCap) {
      return res.status(400).json({ error: 'This event has reached full capacity.' });
    }
  }

  // Atomic Upsert: Match strictly on { eventId, phone } to prevent duplicate document insertion
  const filter = {
    eventId,
    phone: cleanPhone,
  };

  const update = {
    $setOnInsert: {
      eventId,
      phone: cleanPhone,
      name: cleanName,
      status: targetStatus,
      ...(userId ? { userId } : {}),
    },
  };

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const registration = await EventRegistration.findOneAndUpdate(filter, update, options);

  // If document already existed in Approved status, reject duplicate registration
  if (registration.status === 'Approved' || registration.status === 'APPROVED') {
    return res.status(409).json({ error: 'You are already registered for this event.' });
  }

  // If existing document was in FAILED_PAYMENT or PAYMENT_PENDING, update name/status for retry
  if (registration.status !== targetStatus || registration.name !== cleanName) {
    registration.name = cleanName;
    registration.status = targetStatus;
    if (userId) registration.userId = userId;
    await registration.save();
  }

  res.status(200).json({
    message: targetStatus === 'Approved' ? 'Registration successful' : 'Registration pending payment',
    registration: EventRegistration.toPublic(registration),
  });
});

module.exports = {
  registerForEvent
};
