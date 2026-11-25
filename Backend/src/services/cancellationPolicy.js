/**
 * Cancellation & refund policy (platform-wide, set by the Super Admin).
 *  - refundHours:  a paid booking cancelled at least this many hours before the slot gets a full refund
 *  - graceMinutes: a booking cancelled within this many minutes of being made is always refunded
 *
 * Stored in PlatformSetting('cancellation'). Kept in memory so refund checks stay synchronous:
 * loaded at start-up, refreshed every minute, and updated immediately when the admin saves.
 */
const PlatformSetting = require('../models/PlatformSetting');

const KEY = 'cancellation';
const LIMITS = { refundHours: [0, 168], graceMinutes: [0, 120] };

function envDefault(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
const DEFAULTS = () => ({
  refundHours: envDefault('CANCELLATION_REFUND_HOURS', 24),
  graceMinutes: envDefault('CANCELLATION_GRACE_MINUTES', 10),
});

let cache = null; // { refundHours, graceMinutes, updatedAt, updatedBy }

function sanitize(v = {}) {
  const d = DEFAULTS();
  const pick = (k) => {
    const n = Number(v[k]);
    return Number.isFinite(n) && n >= LIMITS[k][0] && n <= LIMITS[k][1] ? n : d[k];
  };
  return { refundHours: pick('refundHours'), graceMinutes: pick('graceMinutes') };
}

async function loadCancellationPolicy() {
  try {
    const doc = await PlatformSetting.findOne({ key: KEY }).populate('updatedBy', 'name email').lean();
    cache = doc
      ? { ...sanitize(doc.value), updatedAt: doc.updatedAt, updatedBy: doc.updatedBy ? { id: String(doc.updatedBy._id), name: doc.updatedBy.name } : null }
      : { ...DEFAULTS(), updatedAt: null, updatedBy: null };
  } catch (err) {
    console.error('[cancellationPolicy] load failed, using last known values:', err.message);
    if (!cache) cache = { ...DEFAULTS(), updatedAt: null, updatedBy: null };
  }
  return cache;
}

/** Current policy (synchronous). */
function getCancellationPolicy() {
  return cache || { ...DEFAULTS(), updatedAt: null, updatedBy: null };
}

/** Validate and save; throws { status: 400 } on bad input. */
async function saveCancellationPolicy(input, userId) {
  const errors = [];
  for (const k of Object.keys(LIMITS)) {
    const n = Number(input?.[k]);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < LIMITS[k][0] || n > LIMITS[k][1]) {
      errors.push(`${k === 'refundHours' ? 'Refund cut-off' : 'Grace period'} must be a whole number from ${LIMITS[k][0]} to ${LIMITS[k][1]}`);
    }
  }
  if (errors.length) { const e = new Error(errors.join('. ')); e.status = 400; throw e; }
  const value = { refundHours: Number(input.refundHours), graceMinutes: Number(input.graceMinutes) };
  await PlatformSetting.findOneAndUpdate({ key: KEY }, { $set: { value, updatedBy: userId || null } }, { upsert: true, new: true });
  return loadCancellationPolicy();
}

let timer = null;
function startCancellationPolicyRefresh() {
  void loadCancellationPolicy();
  if (!timer) { timer = setInterval(() => { void loadCancellationPolicy(); }, 60 * 1000); timer.unref?.(); }
}

module.exports = { getCancellationPolicy, loadCancellationPolicy, saveCancellationPolicy, startCancellationPolicyRefresh, LIMITS };
