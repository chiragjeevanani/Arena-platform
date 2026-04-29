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

  try {
    const registration = await EventRegistration.create({
      eventId,
      name,
      phone,
      userId: req.auth?.sub, // Link to user if logged in
      status: 'Pending'
    });

    res.status(201).json({
      message: 'Registration successful',
      registration: EventRegistration.toPublic(registration)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You are already registered for this event.' });
    }
    throw err;
  }
});

module.exports = {
  registerForEvent
};
