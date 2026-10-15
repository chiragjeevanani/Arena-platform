/**
 * Server-side prices for things paid outside court bookings (memberships, coaching
 * enrolments, paid events). Payment amounts must come from here, never from the client.
 */
const { roundMoney } = require('./pricing');

/** Oman VAT (5%). Override with VAT_PERCENT if the rate ever changes. */
function vatPercent() {
  const n = Number(process.env.VAT_PERCENT);
  return Number.isFinite(n) && n >= 0 ? n : 5;
}

/** Coaching batch total: (fee + registration fee) plus tax — same formula the app shows. */
function enrollmentTotal(batch) {
  const price = Number(batch?.price || 0);
  const regFee = Number(batch?.registrationFee ?? 0);
  const taxPercent = Number(batch?.taxPercent ?? vatPercent());
  const base = price + regFee;
  return roundMoney(base * (1 + taxPercent / 100));
}

/**
 * Event price lives in the CMS subtitle as "Date | Time | Venue | Price | …" (see the app's
 * eventAdapter). Returns { isFree, isTba, amount }.
 */
function eventPrice(cmsEvent) {
  const subtitle = typeof cmsEvent?.subtitle === 'string' ? cmsEvent.subtitle : '';
  const parts = subtitle.split('|').map((s) => s.trim()).filter(Boolean);
  const raw = parts.length >= 4 ? parts[3] : '';
  const lower = raw.toLowerCase();
  const isFree = lower.includes('free');
  const isTba = !raw || lower.includes('tba');
  const amount = isFree || isTba ? 0 : roundMoney(parseFloat(raw.replace(/[^0-9.]/g, '')) || 0);
  return { isFree, isTba, amount };
}

module.exports = { enrollmentTotal, eventPrice, vatPercent };
