const mongoose = require('mongoose');
const EventRegistration = require('../models/EventRegistration');
const CmsContent = require('../models/CmsContent');
const { asyncHandler } = require('../utils/asyncHandler');
const { deductFromWallet } = require('../services/walletService');
const { eventPrice } = require('../services/catalogPricing');

const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId, name, phone, paymentMethod } = req.body;

  if (!eventId || !name || !phone) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }
  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  const userId = req.auth?.sub;

  // Verify event exists before anything else (money included).
  const event = await CmsContent.findById(eventId);
  if (!event || event.kind !== 'event' || !event.isPublished) {
    return res.status(404).json({ error: 'Event not found or invalid' });
  }

  const cleanPhone = String(phone).trim();
  const cleanName = String(name).trim();
  // Price is parsed from the event's CMS subtitle — the same source the app displays.
  const { isFree, isTba, amount: price } = eventPrice(event);
  const noFee = isFree || isTba || !(price > 0);

  if (paymentMethod === 'wallet' && !userId) {
    return res.status(401).json({ error: 'Please log in to pay with your wallet' });
  }

  const targetStatus = (noFee || paymentMethod === 'wallet' || paymentMethod === 'cash')
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

  const existing = await EventRegistration.findOne({ eventId, phone: cleanPhone });
  if (existing && (existing.status === 'Approved' || existing.status === 'APPROVED')) {
    return res.status(409).json({ error: 'You are already registered for this event.' });
  }

  // Charge the wallet only once we know the registration will go through.
  if (paymentMethod === 'wallet' && !noFee) {
    await deductFromWallet(userId, price, 'event_registration', { eventId: String(eventId) });
  }

  // Atomic Upsert: Match strictly on { eventId, phone } to prevent duplicate document insertion
  const registration = await EventRegistration.findOneAndUpdate(
    { eventId, phone: cleanPhone },
    {
      $setOnInsert: {
        eventId,
        phone: cleanPhone,
        name: cleanName,
        status: targetStatus,
        ...(userId ? { userId } : {}),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Existing FAILED_PAYMENT / PAYMENT_PENDING / Cancelled row: update for this retry
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
