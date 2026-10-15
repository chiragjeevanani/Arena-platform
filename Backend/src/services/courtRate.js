/**
 * Per-court hourly rate.
 *
 * Courts used to be created with a *copy* of the arena rate, which went stale when the
 * arena rate changed, so the pricing engine ignored court rates entirely. A court rate now
 * only applies when an admin deliberately sets one (priceOverride: true). Otherwise the
 * court inherits the arena rate. Pricing order: slot price > court rate > arena rate.
 */

function parseRate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    const err = new Error('pricePerHour must be a number >= 0');
    err.status = 400;
    throw err;
  }
  return n;
}

/**
 * Applies { pricePerHour, priceOverride } from a request body to a court document.
 * Older admin screens send pricePerHour on every save without priceOverride; for those a
 * value only counts as a deliberate override when it differs from what's already there
 * (or, on create, from the arena rate).
 */
function applyCourtRate(court, body, { arenaRate, isCreate = false } = {}) {
  const rate = parseRate(body.pricePerHour);
  const explicit = typeof body.priceOverride === 'boolean' ? body.priceOverride : undefined;

  if (explicit === false) {
    court.priceOverride = false;
    court.pricePerHour = null;
    return;
  }
  if (rate === undefined) {
    if (explicit === true && court.pricePerHour > 0) court.priceOverride = true;
    return;
  }
  if (rate === null || rate === 0) {
    court.priceOverride = false;
    court.pricePerHour = null;
    return;
  }
  if (explicit === true) {
    court.priceOverride = true;
    court.pricePerHour = rate;
    return;
  }
  if (isCreate) {
    // Create screens pre-fill the arena rate; only a different value is a real court rate.
    const changed = !Number.isFinite(Number(arenaRate)) || Math.abs(rate - Number(arenaRate)) > 0.0005;
    court.priceOverride = changed;
    court.pricePerHour = changed ? rate : null;
    return;
  }
  // Updates: the API reports inheriting courts with pricePerHour null, so a number sent back
  // here is one the admin typed.
  court.priceOverride = true;
  court.pricePerHour = rate;
}

/** The hourly rate the court actually charges (before slot prices / peak rules). */
function effectiveCourtRate(court, arena) {
  if (court?.priceOverride && Number(court.pricePerHour) > 0) return Number(court.pricePerHour);
  return Number(arena?.pricePerHour || 0);
}

module.exports = { applyCourtRate, effectiveCourtRate };
