const mongoose = require('mongoose');
const User = require('../models/User');
const RefundRecord = require('../models/RefundRecord');
const { getOrCreateWallet } = require('../services/walletService');
const { listRefundables, refundCustomer } = require('../services/customerRefunds');

async function customerOr404(userId, res) {
  if (!mongoose.isValidObjectId(userId)) { res.status(400).json({ error: 'Invalid customer' }); return null; }
  const u = await User.findById(userId).select('name email phone role isActive').lean();
  if (!u) { res.status(404).json({ error: 'Customer not found' }); return null; }
  return u;
}

/** GET /admin/customers/:userId/refundables — the customer's purchases with paid / refunded / refundable. */
async function getRefundables(req, res) {
  const u = await customerOr404(req.params.userId, res); if (!u) return;
  const [items, wallet, history] = await Promise.all([
    listRefundables(u._id),
    getOrCreateWallet(u._id),
    RefundRecord.find({ userId: u._id }).sort({ createdAt: -1 }).limit(50).populate('by', 'name email').lean(),
  ]);
  return res.json({
    customer: { id: String(u._id), name: u.name, email: u.email, phone: u.phone || '', role: u.role },
    walletBalance: Number(wallet?.balance || 0),
    items,
    history: history.map((h) => ({ id: String(h._id), at: h.createdAt, amount: h.amount, kind: h.kind, what: h.sourceLabel, reason: h.reason, by: h.by?.name || h.by?.email || '', cancelledBooking: !!h.cancelledBooking })),
  });
}

/** POST /admin/customers/:userId/refunds { sourceType, sourceId?, mode, amount?, reason, cancelBooking? } */
async function postRefund(req, res) {
  const u = await customerOr404(req.params.userId, res); if (!u) return;
  const out = await refundCustomer(u._id, req.body || {}, req.auth.sub);
  return res.status(201).json({ refund: { id: String(out.record._id), amount: out.amount, cancelledBooking: !!out.cancelledBooking } });
}

/** GET /admin/customer-refunds — the most recent refunds given by Super Admin, across customers. */
async function listRecentRefunds(req, res) {
  const rows = await RefundRecord.find({}).sort({ createdAt: -1 }).limit(100).populate('userId', 'name email phone').populate('by', 'name email').lean();
  return res.json({
    refunds: rows.map((h) => ({
      id: String(h._id), at: h.createdAt, amount: h.amount, kind: h.kind, what: h.sourceLabel, reason: h.reason,
      customer: { id: String(h.userId?._id || h.userId), name: h.userId?.name || '', email: h.userId?.email || '' },
      by: h.by?.name || h.by?.email || '', cancelledBooking: !!h.cancelledBooking,
    })),
  });
}

module.exports = { getRefundables, postRefund, listRecentRefunds };
