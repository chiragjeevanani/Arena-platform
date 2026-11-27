/**
 * Monthly coaching fees and reminders.
 *
 * Each enrolment has `paidUntil` — the last day (inclusive) the student has paid for. Joining
 * online pays the first month; the arena records later months ("Fee paid") or the student pays
 * from the wallet in the app. Reminders (app notifications):
 *   - 3 days before paidUntil ("fee due on …")
 *   - the day after it lapses ("fee overdue"), then every 3 days, at most 4 times
 * No reminders once the student has paid up to the batch end date, or after the batch has ended.
 * Membership plans and slot memberships get "ends in N days" (7 days before) and "has ended".
 */
const BatchEnrollment = require('../models/BatchEnrollment');
const CoachingBatch = require('../models/CoachingBatch');
const UserMembership = require('../models/UserMembership');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const { createNotification } = require('./notificationService');
const { arenaTodayYmd } = require('./slotAvailability');
const { vatPercent } = require('./catalogPricing');
const { roundMoney } = require('./pricing');

const DUE_SOON_DAYS = 3;
const OVERDUE_REPEAT_DAYS = 3;
const OVERDUE_MAX = 4;
const MEMBERSHIP_NOTICE_DAYS = 7;
const PLACEHOLDER_EMAIL = /@offline\.ammarena\.invalid$/i;

const toDate = (ymd) => new Date(`${ymd}T12:00:00Z`);
const ymdOf = (d) => d.toISOString().slice(0, 10);
const addDays = (ymd, n) => { const d = toDate(ymd); d.setUTCDate(d.getUTCDate() + n); return ymdOf(d); };
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
const fmt = (ymd) => toDate(ymd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Last day of a paid period of `months` months starting on `from` (e.g. 10 Nov + 1 month → 9 Dec). */
function periodEnd(from, months) {
  const [y, m, d] = from.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1, 12));
  const dim = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12)).getUTCDate();
  target.setUTCDate(Math.min(d, dim));
  return addDays(ymdOf(target), -1);
}

/** Monthly fee incl. VAT (no registration fee — that is charged once when joining). */
function monthlyFee(batch) {
  const price = Number(batch?.price || 0);
  const tax = Number(batch?.taxPercent ?? vatPercent());
  return roundMoney(price * (1 + tax / 100));
}

/** The paid period a new payment of `months` months covers, capped at the batch end date. */
function nextPeriod(enrollment, batch, months, today = arenaTodayYmd()) {
  const start = batch.startDate && batch.startDate > today ? batch.startDate : today;
  const from = enrollment.paidUntil ? addDays(enrollment.paidUntil, 1) : start;
  let to = periodEnd(from, months);
  if (batch.endDate && to > batch.endDate) to = batch.endDate;
  return { from, to };
}

/** Where a student stands with fees. */
function feeStatus(enrollment, batch, today = arenaTodayYmd()) {
  const paidUntil = enrollment.paidUntil || null;
  const ended = !!(batch?.endDate && batch.endDate < today);
  if (!paidUntil) return { state: 'not_recorded', paidUntil: null, label: 'Fee not recorded', monthlyFee: monthlyFee(batch) };
  if (batch?.endDate && paidUntil >= batch.endDate) return { state: 'covered', paidUntil, label: 'Paid to the end of the batch', monthlyFee: monthlyFee(batch) };
  if (ended) return { state: 'ended', paidUntil, label: `Paid until ${fmt(paidUntil)}`, monthlyFee: monthlyFee(batch) };
  const left = daysBetween(today, paidUntil);
  if (left < 0) return { state: 'overdue', paidUntil, daysOverdue: -left, label: `Overdue ${-left} day${-left === 1 ? '' : 's'}`, monthlyFee: monthlyFee(batch) };
  if (left <= DUE_SOON_DAYS) return { state: 'due_soon', paidUntil, daysLeft: left, label: left === 0 ? 'Fee due today' : `Fee due in ${left} day${left === 1 ? '' : 's'}`, monthlyFee: monthlyFee(batch) };
  return { state: 'paid', paidUntil, daysLeft: left, label: `Paid until ${fmt(paidUntil)}`, monthlyFee: monthlyFee(batch) };
}

/** Records a payment and moves paidUntil forward. `enrollment` is a mongoose document. */
async function recordFeePayment(enrollment, batch, { months = 1, amount, method = 'cash', recordedBy = null, kind = 'renewal', today } = {}) {
  const m = Math.max(1, Math.min(12, Math.round(Number(months) || 1)));
  const { from, to } = nextPeriod(enrollment, batch, m, today);
  if (to < from) { const e = new Error('The batch has already ended — nothing left to pay for'); e.status = 400; throw e; }
  const amt = amount === undefined || amount === null || amount === '' ? roundMoney(monthlyFee(batch) * m) : roundMoney(Number(amount));
  if (!Number.isFinite(amt) || amt < 0) { const e = new Error('Amount must be 0 or more'); e.status = 400; throw e; }
  enrollment.paidUntil = to;
  enrollment.feePayments.push({ kind, from, to, months: m, amount: method === 'waived' ? 0 : amt, method, recordedBy, at: new Date() });
  enrollment.feeReminders = { dueFor: null, overdueFor: null, overdueCount: 0, lastOverdueAt: null };
  await enrollment.save();
  return { from, to, amount: method === 'waived' ? 0 : amt, months: m };
}

/** First month when a student joins and pays online / from the wallet. */
async function startPaidPeriod(enrollmentId, batch, method) {
  const e = await BatchEnrollment.findById(enrollmentId);
  if (!e || e.paidUntil) return;
  const today = arenaTodayYmd();
  const start = batch.startDate && batch.startDate > today ? batch.startDate : today;
  let to = periodEnd(start, 1);
  if (batch.endDate && to > batch.endDate) to = batch.endDate;
  e.paidUntil = to;
  e.feePayments.push({ kind: 'join', from: start, to, months: 1, amount: monthlyFee(batch), method, at: new Date() });
  await e.save();
}

// ---------------------------------------------------------------- reminders

async function sendCoachingFeeReminders(now = new Date()) {
  const today = arenaTodayYmd(now);
  const batches = await CoachingBatch.find({ endDate: { $gte: today } }).select('_id title endDate startDate price taxPercent arenaId').lean();
  if (!batches.length) return { sent: 0 };
  const batchById = new Map(batches.map((b) => [String(b._id), b]));
  const list = await BatchEnrollment.find({
    batchId: { $in: batches.map((b) => b._id) },
    status: 'confirmed',
    paidUntil: { $ne: null, $lte: addDays(today, DUE_SOON_DAYS) },
  });
  const users = await User.find({ _id: { $in: list.map((e) => e.userId) } }).select('email isActive').lean();
  const canSee = new Set(users.filter((u) => u.isActive !== false && u.email && !PLACEHOLDER_EMAIL.test(u.email)).map((u) => String(u._id)));
  let sent = 0;
  for (const e of list) {
    const b = batchById.get(String(e.batchId));
    if (!b || e.paidUntil >= b.endDate) continue;
    if (!canSee.has(String(e.userId))) continue; // no app login: the arena sees them in "Fees due"
    const st = feeStatus(e, b, today);
    const fee = `OMR ${monthlyFee(b).toFixed(3)}`;
    const r = e.feeReminders || {};
    let title = null; let message = null; let patch = null;
    if (st.state === 'due_soon' && r.dueFor !== e.paidUntil) {
      title = st.daysLeft === 0 ? 'Coaching fee due today' : `Coaching fee due in ${st.daysLeft} day${st.daysLeft === 1 ? '' : 's'}`;
      message = `Your ${b.title} fee is paid until ${fmt(e.paidUntil)}. The next month (${fee}) is due — pay from your wallet in the app (Bookings → Coaching) or at the arena desk.`;
      patch = { 'feeReminders.dueFor': e.paidUntil };
    } else if (st.state === 'overdue') {
      const first = r.overdueFor !== e.paidUntil;
      const repeatDue = !first && (r.overdueCount || 0) < OVERDUE_MAX && r.lastOverdueAt && (now - new Date(r.lastOverdueAt)) >= OVERDUE_REPEAT_DAYS * 864e5;
      if (first || repeatDue) {
        title = 'Coaching fee overdue';
        message = `Your ${b.title} fee ended on ${fmt(e.paidUntil)} (${st.daysOverdue} day${st.daysOverdue === 1 ? '' : 's'} ago). Please pay the next month (${fee}) from your wallet in the app or at the arena desk to keep your place.`;
        patch = { 'feeReminders.overdueFor': e.paidUntil, 'feeReminders.overdueCount': first ? 1 : (r.overdueCount || 0) + 1, 'feeReminders.lastOverdueAt': now };
      }
    }
    if (!title) continue;
    await createNotification(e.userId, title, message, 'warning', { kind: 'coaching_fee', enrollmentId: String(e._id), batchId: String(b._id), paidUntil: e.paidUntil });
    await BatchEnrollment.updateOne({ _id: e._id, paidUntil: e.paidUntil }, { $set: patch });
    sent++;
  }
  return { sent };
}

async function sendMembershipReminders(now = new Date()) {
  let sent = 0;
  const soon = new Date(now.getTime() + MEMBERSHIP_NOTICE_DAYS * 864e5);
  const recent = new Date(now.getTime() - 7 * 864e5); // don't announce long-ago endings
  const list = await UserMembership.find({
    status: { $ne: 'cancelled' },
    expiresAt: { $gte: recent, $lte: soon },
  }).lean();
  if (!list.length) return { sent };
  const plans = await MembershipPlan.find({ _id: { $in: list.map((m) => m.membershipPlanId).filter(Boolean) } }).select('name').lean();
  const planName = new Map(plans.map((p) => [String(p._id), p.name]));
  for (const m of list) {
    const exp = new Date(m.expiresAt);
    const isSlot = Array.isArray(m.bookedSlots) && m.bookedSlots.length > 0;
    const what = isSlot ? 'slot membership' : `membership${planName.get(String(m.membershipPlanId)) ? ` "${planName.get(String(m.membershipPlanId))}"` : ''}`;
    const when = fmt(ymdOf(new Date(exp.getTime() + 4 * 36e5)));
    const same = (d) => d && new Date(d).getTime() === exp.getTime();
    if (exp > now && !same(m.endingNotifiedFor)) {
      const days = Math.max(0, Math.ceil((exp - now) / 864e5));
      await createNotification(m.userId, `Your ${isSlot ? 'slot membership' : 'membership'} ends in ${days} day${days === 1 ? '' : 's'}`,
        `Your ${what} ends on ${when}. Renew it in the app (Profile → ${isSlot ? 'Slot Memberships' : 'Membership'}) to keep your ${isSlot ? 'weekly court slot' : 'booking discount'}.`,
        'warning', { kind: 'membership_ending', membershipId: String(m._id) });
      await UserMembership.updateOne({ _id: m._id }, { $set: { endingNotifiedFor: exp } });
      sent++;
    } else if (exp <= now && !same(m.endedNotifiedFor)) {
      await createNotification(m.userId, `Your ${isSlot ? 'slot membership' : 'membership'} has ended`,
        `Your ${what} ended on ${when}. Renew it in the app (Profile → ${isSlot ? 'Slot Memberships' : 'Membership'}) whenever you like.`,
        'info', { kind: 'membership_ended', membershipId: String(m._id) });
      await UserMembership.updateOne({ _id: m._id }, { $set: { endedNotifiedFor: exp, endingNotifiedFor: exp } });
      sent++;
    }
  }
  return { sent };
}

let timer = null;
function startFeeReminders() {
  if (timer) return;
  const run = async () => {
    try { await sendCoachingFeeReminders(); } catch (e) { console.error('[fees] coaching reminders failed', e.message); }
    try { await sendMembershipReminders(); } catch (e) { console.error('[fees] membership reminders failed', e.message); }
  };
  setTimeout(run, 45 * 1000);
  timer = setInterval(run, 60 * 60 * 1000);
}

module.exports = {
  periodEnd, monthlyFee, nextPeriod, feeStatus, recordFeePayment, startPaidPeriod,
  sendCoachingFeeReminders, sendMembershipReminders, startFeeReminders, addDays,
};
