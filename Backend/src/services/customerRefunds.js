/**
 * Super Admin refunds to a customer's Arena Wallet — full or partial, at any time.
 *
 * Purchases the customer paid for, with what was paid and what was already refunded:
 *   booking    — court bookings (paid amount; refunded = booking.refundedAmount)
 *   enrollment — coaching (wallet + card payments for it, plus fees recorded at the desk)
 *   event      — event entry fees (wallet + card payments)
 *   membership — membership plans and slot memberships (amountPaid)
 * A refund is capped at paid − refunded, so partial refunds can't exceed what was paid.
 */
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const BatchEnrollment = require('../models/BatchEnrollment');
const CoachingBatch = require('../models/CoachingBatch');
const CmsContent = require('../models/CmsContent');
const UserMembership = require('../models/UserMembership');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const WalletTransaction = require('../models/WalletTransaction');
const Court = require('../models/Court');
const RefundRecord = require('../models/RefundRecord');
const { creditWallet } = require('./walletService');
const { roundMoney } = require('./pricing');
const { createNotification } = require('./notificationService');

const TYPES = ['booking', 'enrollment', 'event', 'membership'];
const MAX_GENERAL = 10000;
const err = (status, message) => Object.assign(new Error(message), { status });

async function refundedBySource(userId) {
  const rows = await RefundRecord.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(String(userId)), sourceType: { $ne: 'general' } } },
    { $group: { _id: { t: '$sourceType', id: '$sourceId' }, total: { $sum: '$amount' } } },
  ]);
  return new Map(rows.map((r) => [`${r._id.t}:${r._id.id}`, r.total]));
}

/** Everything this customer paid for that can still be (partly) refunded, newest first. */
async function listRefundables(userId) {
  const uid = new mongoose.Types.ObjectId(String(userId));
  const refunded = await refundedBySource(userId);
  const items = [];

  // Court bookings
  const bookings = await Booking.find({ userId: uid, $or: [{ paymentStatus: { $in: ['paid', 'refunded'] } }, { refundedAmount: { $gt: 0 } }] }).sort({ date: -1 }).limit(300).lean();
  const courts = await Court.find({ _id: { $in: [...new Set(bookings.map((b) => String(b.courtId)))] } }).select('name').lean();
  const courtName = new Map(courts.map((c) => [String(c._id), c.name]));
  for (const b of bookings) {
    const paid = roundMoney(Number(b.amount || 0));
    if (paid <= 0) continue;
    items.push({
      type: 'booking', id: String(b._id), date: b.date,
      title: `Court booking · ${courtName.get(String(b.courtId)) || 'Court'} · ${b.date} ${b.timeSlot}`,
      detail: `${b.type === 'walkin' ? 'Walk-in' : 'App'} · ${b.paymentMethod || ''} · ${b.status}`,
      status: b.status,
      paid, refunded: roundMoney(Number(b.refundedAmount || 0)),
    });
  }

  // Coaching enrolments: wallet debits + card payments for them + desk (cash/card) fees
  const enrollments = await BatchEnrollment.find({ userId: uid }).sort({ createdAt: -1 }).lean();
  if (enrollments.length) {
    const ids = enrollments.map((e) => String(e._id));
    const batches = await CoachingBatch.find({ _id: { $in: enrollments.map((e) => e.batchId) } }).select('title').lean();
    const title = new Map(batches.map((b) => [String(b._id), b.title]));
    const wtx = await WalletTransaction.find({ userId: uid, type: 'debit', reason: { $in: ['coaching_enrollment', 'coaching_fee'] }, 'meta.enrollmentId': { $in: ids } }).select('amount meta').lean();
    const pays = await Payment.find({ userId: uid, status: 'succeeded', 'meta.enrollmentId': { $in: ids } }).select('amount meta').lean();
    for (const e of enrollments) {
      const id = String(e._id);
      const desk = (e.feePayments || []).filter((p) => ['cash', 'card'].includes(p.method)).reduce((n, p) => n + Number(p.amount || 0), 0);
      const paid = roundMoney(
        wtx.filter((t) => t.meta?.enrollmentId === id).reduce((n, t) => n + Number(t.amount || 0), 0)
        + pays.filter((p) => p.meta?.enrollmentId === id).reduce((n, p) => n + Number(p.amount || 0), 0)
        + desk
      );
      if (paid <= 0) continue;
      items.push({
        type: 'enrollment', id, date: new Date(e.createdAt).toISOString().slice(0, 10),
        title: `Coaching · ${title.get(String(e.batchId)) || 'Batch'}`,
        detail: `${e.status}${e.paidUntil ? ` · fee paid until ${e.paidUntil}` : ''}`,
        status: e.status,
        paid, refunded: roundMoney(refunded.get(`enrollment:${id}`) || 0),
      });
    }
  }

  // Events: wallet debits + card payments, grouped per event
  const evTx = await WalletTransaction.find({ userId: uid, type: 'debit', reason: 'event_registration' }).select('amount meta createdAt').lean();
  const evPay = await Payment.find({ userId: uid, status: 'succeeded', 'meta.eventId': { $exists: true } }).select('amount meta createdAt').lean();
  const byEvent = new Map();
  for (const t of [...evTx, ...evPay]) {
    const id = String(t.meta?.eventId || ''); if (!id) continue;
    const cur = byEvent.get(id) || { paid: 0, at: t.createdAt };
    cur.paid += Number(t.amount || 0); byEvent.set(id, cur);
  }
  if (byEvent.size) {
    const evs = await CmsContent.find({ _id: { $in: [...byEvent.keys()].filter((x) => mongoose.isValidObjectId(x)) } }).select('title').lean();
    const evTitle = new Map(evs.map((x) => [String(x._id), x.title]));
    for (const [id, v] of byEvent) {
      if (v.paid <= 0) continue;
      items.push({ type: 'event', id, date: new Date(v.at).toISOString().slice(0, 10), title: `Event · ${evTitle.get(id) || 'Event'}`, detail: 'Entry fee', status: '', paid: roundMoney(v.paid), refunded: roundMoney(refunded.get(`event:${id}`) || 0) });
    }
  }

  // Memberships (plans and slot memberships)
  const mems = await UserMembership.find({ userId: uid, amountPaid: { $gt: 0 } }).sort({ createdAt: -1 }).lean();
  if (mems.length) {
    const plans = await MembershipPlan.find({ _id: { $in: mems.map((m) => m.membershipPlanId).filter(Boolean) } }).select('name').lean();
    const planName = new Map(plans.map((p) => [String(p._id), p.name]));
    for (const m of mems) {
      const slot = (m.bookedSlots || []).length > 0;
      items.push({
        type: 'membership', id: String(m._id), date: new Date(m.startsAt || m.createdAt).toISOString().slice(0, 10),
        title: slot ? 'Slot membership' : `Membership · ${planName.get(String(m.membershipPlanId)) || 'Plan'}`,
        detail: `${m.status} · until ${new Date(m.expiresAt).toISOString().slice(0, 10)}`,
        status: m.status,
        paid: roundMoney(Number(m.amountPaid || 0)), refunded: roundMoney(refunded.get(`membership:${m._id}`) || 0),
      });
    }
  }

  for (const it of items) it.refundable = roundMoney(Math.max(0, it.paid - it.refunded));
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return items;
}

/**
 * Refund to the wallet. body: { sourceType, sourceId?, mode: 'full'|'partial', amount?, reason, cancelBooking? }
 * sourceType 'general' = not linked to a purchase (amount required).
 */
async function refundCustomer(userId, body, byUserId) {
  const sourceType = String(body.sourceType || '');
  const reason = String(body.reason || '').trim().slice(0, 300);
  if (!reason) throw err(400, 'Enter a reason for the refund');

  if (sourceType === 'general') {
    const amount = roundMoney(Number(body.amount));
    if (!(amount > 0) || amount > MAX_GENERAL) throw err(400, `Enter an amount between 0.001 and ${MAX_GENERAL}`);
    const rec = await RefundRecord.create({ userId, sourceType, sourceId: '', sourceLabel: 'General refund', amount, kind: 'general', reason, by: byUserId });
    await creditWallet(userId, amount, 'refund', { source: 'admin_refund', refundRecordId: String(rec._id), reason });
    await createNotification(userId, 'Refund received', `OMR ${amount.toFixed(3)} has been refunded to your Arena Wallet. Reason: ${reason}`, 'success', { kind: 'admin_refund', refundRecordId: String(rec._id) });
    return { record: rec.toObject(), amount };
  }

  if (!TYPES.includes(sourceType)) throw err(400, 'Choose what to refund');
  const sourceId = String(body.sourceId || '');
  const item = (await listRefundables(userId)).find((i) => i.type === sourceType && i.id === sourceId);
  if (!item) throw err(404, 'Purchase not found for this customer');
  if (item.refundable <= 0) throw err(409, 'This has already been fully refunded');
  const mode = body.mode === 'partial' ? 'partial' : 'full';
  const amount = mode === 'full' ? item.refundable : roundMoney(Number(body.amount));
  if (!(amount > 0)) throw err(400, 'Enter the amount to refund');
  if (amount > item.refundable + 0.0005) throw err(400, `You can refund at most OMR ${item.refundable.toFixed(3)} for this`);

  let cancelledBooking = false;
  if (sourceType === 'booking') {
    // Atomic cap: refundedAmount can never go above what was paid.
    const b = await Booking.findOneAndUpdate(
      { _id: sourceId, userId, $expr: { $lte: [{ $add: [{ $ifNull: ['$refundedAmount', 0] }, amount] }, { $add: ['$amount', 0.0005] }] } },
      { $inc: { refundedAmount: amount } },
      { new: true }
    );
    if (!b) throw err(409, 'This booking was refunded meanwhile — refresh and try again');
    const fully = roundMoney(b.refundedAmount) >= roundMoney(b.amount);
    const set = { refundMethod: 'wallet' };
    if (fully) Object.assign(set, { paymentStatus: 'refunded', refundedAt: b.refundedAt || new Date() });
    if (body.cancelBooking && ['confirmed', 'pending', 'rescheduled'].includes(b.status)) {
      Object.assign(set, { status: 'cancelled', cancelledAt: new Date(), cancelledBy: 'staff' });
      cancelledBooking = true;
    }
    await Booking.updateOne({ _id: b._id }, { $set: set });
  }

  const rec = await RefundRecord.create({ userId, sourceType, sourceId, sourceLabel: item.title, amount, kind: mode, reason, cancelledBooking, by: byUserId });
  if (sourceType !== 'booking') {
    // Re-check the cap after writing (two refunds at the same moment can't both pass).
    const total = (await RefundRecord.aggregate([{ $match: { sourceType, sourceId } }, { $group: { _id: null, t: { $sum: '$amount' } } }]))[0]?.t || 0;
    if (total > item.paid + 0.0005) { await RefundRecord.deleteOne({ _id: rec._id }); throw err(409, 'This was refunded meanwhile — refresh and try again'); }
  }
  await creditWallet(userId, amount, 'refund', { source: 'admin_refund', refundRecordId: String(rec._id), sourceType, sourceId, ...(sourceType === 'booking' ? { bookingId: sourceId } : {}), reason });
  await createNotification(
    userId,
    mode === 'full' ? 'Refund received' : 'Partial refund received',
    `OMR ${amount.toFixed(3)} for ${item.title} has been refunded to your Arena Wallet.${cancelledBooking ? ' The booking has been cancelled.' : ''} Reason: ${reason}`,
    'success',
    { kind: 'admin_refund', refundRecordId: String(rec._id), sourceType, sourceId }
  );
  return { record: rec.toObject(), amount, cancelledBooking };
}

module.exports = { listRefundables, refundCustomer, MAX_GENERAL };
