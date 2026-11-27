const mongoose = require('mongoose');
const EventRegistration = require('../models/EventRegistration');
const CmsContent = require('../models/CmsContent');
const { asyncHandler } = require('../utils/asyncHandler');
const { deductFromWallet } = require('../services/walletService');
const { eventPrice } = require('../services/catalogPricing');
const { arenaTodayYmd } = require('../services/slotAvailability');

const ACTIVE_STATUSES = ['Approved', 'APPROVED', 'PAYMENT_PENDING', 'Pending'];
const clean = (s, max = 80) => String(s || '').trim().slice(0, max);

/**
 * POST /public/events/register
 * { eventId, categoryId?, name, phone, arenaIdNumber?, teamName?, players?: [{ name, idNumber? }], paymentMethod }
 * Events with categories (Singles / Doubles / Team …): the fee comes from the category and is paid
 * once per entry; pairs need the partner's name, teams the names of all team-mates (IDs optional).
 */
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

  // Last day of the event: structured schedule, else the first part of the CMS subtitle.
  const lastDay = event.eventInfo?.endDate || event.eventInfo?.startDate || String(event.subtitle || '').split('|')[0].trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(lastDay) && lastDay < arenaTodayYmd()) {
    return res.status(400).json({ error: 'This event has already taken place' });
  }

  const cleanPhone = String(phone).trim();
  const cleanName = clean(name);

  // ---- category, players, fee
  const categories = event.eventInfo?.categories || [];
  let category = null;
  let players = [];
  if (categories.length) {
    category = categories.find((c) => String(c._id) === String(req.body.categoryId || ''));
    if (!category) return res.status(400).json({ error: 'Choose a category' });
    const given = (Array.isArray(req.body.players) ? req.body.players : [])
      .map((p) => ({ name: clean(p?.name), idNumber: clean(p?.idNumber, 40) }))
      .filter((p) => p.name || p.idNumber);
    if (given.some((p) => !p.name)) return res.status(400).json({ error: 'Enter the name of every player (ID is optional)' });
    const others = { single: [0, 0], pair: [1, 1], team: [Math.max(0, (category.minPlayers || 2) - 1), Math.max(0, (category.maxPlayers || 2) - 1)] }[category.type || 'single'];
    if (given.length < others[0] || given.length > others[1]) {
      return res.status(400).json({
        error: category.type === 'pair' ? `${category.name}: enter your partner's name`
          : category.type === 'team' ? `${category.name}: a team has ${category.minPlayers}–${category.maxPlayers} players — enter ${others[0]}–${others[1]} team-mates besides you`
            : `${category.name} is for one player`,
      });
    }
    players = given;
  }
  const { isFree, isTba, amount: price } = category ? { isFree: !(category.fee > 0), isTba: false, amount: Number(category.fee) || 0 } : eventPrice(event);
  const noFee = isFree || isTba || !(price > 0);

  if (paymentMethod === 'wallet' && !userId) {
    return res.status(401).json({ error: 'Please log in to pay with your wallet' });
  }

  const targetStatus = (noFee || paymentMethod === 'wallet' || paymentMethod === 'cash')
    ? 'Approved'
    : 'PAYMENT_PENDING';

  const catKey = category ? String(category._id) : '';
  const catMatch = catKey ? catKey : { $in: ['', null] }; // older registrations have no category field
  const existing = await EventRegistration.findOne({ eventId, phone: cleanPhone, categoryId: catMatch });
  if (existing && (existing.status === 'Approved' || existing.status === 'APPROVED')) {
    return res.status(409).json({ error: category ? `You are already registered for ${category.name}.` : 'You are already registered for this event.' });
  }

  // Capacity: per category (entries) and for the whole event.
  if (category && category.maxEntries > 0) {
    const n = await EventRegistration.countDocuments({ eventId, categoryId: catKey, status: { $in: ACTIVE_STATUSES }, phone: { $ne: cleanPhone } });
    if (n >= category.maxEntries) return res.status(400).json({ error: `${category.name} is full.` });
  }
  const maxCap = Number(event.capacity || event.maxParticipants || 0);
  if (maxCap > 0) {
    const activeCount = await EventRegistration.countDocuments({
      eventId,
      status: { $in: ACTIVE_STATUSES },
      $nor: [{ phone: cleanPhone, categoryId: catMatch }], // exclude this entry if re-trying
    });
    if (activeCount >= maxCap) {
      return res.status(400).json({ error: 'This event has reached full capacity.' });
    }
  }

  // Charge the wallet only once we know the registration will go through.
  if (paymentMethod === 'wallet' && !noFee) {
    await deductFromWallet(userId, price, 'event_registration', { eventId: String(eventId), categoryId: catKey });
  }

  const details = {
    name: cleanName,
    categoryId: catKey,
    categoryName: category?.name || '',
    categoryType: category?.type || '',
    fee: noFee ? 0 : price,
    paymentMethod: noFee ? 'free' : String(paymentMethod || 'online'),
    arenaIdNumber: clean(req.body.arenaIdNumber, 40),
    teamName: clean(req.body.teamName),
    players,
  };

  // Atomic upsert on { eventId, phone, categoryId } — one entry per person per category.
  const registration = await EventRegistration.findOneAndUpdate(
    { eventId, phone: cleanPhone, categoryId: catMatch },
    { $setOnInsert: { eventId, phone: cleanPhone, status: targetStatus, ...(userId ? { userId } : {}), ...details } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Existing FAILED_PAYMENT / PAYMENT_PENDING / Cancelled row: update for this retry
  if (registration.status !== targetStatus || registration.name !== cleanName || existing) {
    Object.assign(registration, details, { status: targetStatus });
    if (userId) registration.userId = userId;
    await registration.save();
  }

  res.status(200).json({
    message: targetStatus === 'Approved' ? 'Registration successful' : 'Registration pending payment',
    registration: EventRegistration.toPublic(registration),
    amount: noFee ? 0 : price,
  });
});

module.exports = {
  registerForEvent
};
