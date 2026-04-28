const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const CoachingBatch = require('../models/CoachingBatch');
const InventoryItem = require('../models/InventoryItem');
const CmsContent = require('../models/CmsContent');
const Court = require('../models/Court');
const AvailabilityBlock = require('../models/AvailabilityBlock');
const PosSale = require('../models/PosSale');

const STAFF_ROLES = ['SUPER_ADMIN', 'ARENA_ADMIN', 'RECEPTIONIST'];

async function requireArenaStaff(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!STAFF_ROLES.includes(req.auth.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await User.findById(req.auth.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let aid = user.assignedArenaId;

  // SUPER_ADMIN can specify arenaId via header or query
  if (user.role === 'SUPER_ADMIN') {
    const headerAid = req.headers['x-arena-id'];
    const queryAid = req.query.arenaId;
    const bodyAid = req.body.arenaId;
    aid = headerAid || queryAid || bodyAid;
  }

  if (!aid || !mongoose.isValidObjectId(aid)) {
    return res.status(403).json({ error: 'Operational scope (arenaId) is required for this request.' });
  }

  req.arenaScopeId = String(aid);
  return next();
}

function requireQueryArenaMatchesScope(req, res, next) {
  const q = req.query.arenaId;
  if (!q || !mongoose.isValidObjectId(q)) {
    return res.status(400).json({ error: 'arenaId query is required' });
  }
  if (String(q) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

function requireBodyArenaIdMatchesScope(req, res, next) {
  const arenaId = req.body?.arenaId;
  if (!arenaId || !mongoose.isValidObjectId(arenaId)) {
    return res.status(400).json({ error: 'arenaId is required in body' });
  }
  if (String(arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireBookingInArenaScope(req, res, next) {
  const { bookingId } = req.params;
  if (!mongoose.isValidObjectId(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking id' });
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (String(booking.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireCoachingBatchInArenaScope(req, res, next) {
  const { batchId } = req.params;
  if (!mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ error: 'Invalid batch id' });
  }
  const batch = await CoachingBatch.findById(batchId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }
  if (String(batch.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireInventoryItemInArenaScope(req, res, next) {
  const { itemId } = req.params;
  if (!mongoose.isValidObjectId(itemId)) {
    return res.status(400).json({ error: 'Invalid item id' });
  }
  const item = await InventoryItem.findById(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (String(item.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireCmsContentInArenaScope(req, res, next) {
  const { contentId } = req.params;
  if (!mongoose.isValidObjectId(contentId)) {
    return res.status(400).json({ error: 'Invalid content id' });
  }
  const doc = await CmsContent.findById(contentId);
  if (!doc) {
    return res.status(404).json({ error: 'Content not found' });
  }
  if (!doc.arenaId || String(doc.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireCourtInArenaScope(req, res, next) {
  const { courtId } = req.params;
  if (!mongoose.isValidObjectId(courtId)) {
    return res.status(400).json({ error: 'Invalid court id' });
  }
  const court = await Court.findById(courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found' });
  }
  if (String(court.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireBlockInArenaScope(req, res, next) {
  const { blockId } = req.params;
  if (!mongoose.isValidObjectId(blockId)) {
    return res.status(400).json({ error: 'Invalid block id' });
  }
  const block = await AvailabilityBlock.findById(blockId);
  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }
  if (String(block.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

async function requireSaleInArenaScope(req, res, next) {
  const { saleId } = req.params;
  if (!mongoose.isValidObjectId(saleId)) {
    return res.status(400).json({ error: 'Invalid sale id' });
  }
  const sale = await PosSale.findById(saleId);
  if (!sale) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  if (String(sale.arenaId) !== req.arenaScopeId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

module.exports = {
  requireArenaStaff,
  requireQueryArenaMatchesScope,
  requireBodyArenaIdMatchesScope,
  requireBookingInArenaScope,
  requireCoachingBatchInArenaScope,
  requireInventoryItemInArenaScope,
  requireCmsContentInArenaScope,
  requireCourtInArenaScope,
  requireBlockInArenaScope,
  requireSaleInArenaScope,
};
