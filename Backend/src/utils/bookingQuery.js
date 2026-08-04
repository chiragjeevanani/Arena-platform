/**
 * Shared booking query utilities to enforce a single consistent definition
 * of an "active booking" across all backend controllers.
 */

function getHoldCutoff(minutes) {
  const holdMinutes = minutes || Number(process.env.BOOKING_PAYMENT_HOLD_MINUTES) || 15;
  return new Date(Date.now() - holdMinutes * 60 * 1000);
}

function getActiveBookingFilter(holdCutoff = getHoldCutoff()) {
  return [
    { status: 'confirmed' },
    { status: 'rescheduled' },
    {
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $gte: holdCutoff },
    },
  ];
}

/**
 * Builds a query object to check if a specific court slot is already actively booked.
 *
 * Options:
 *  - courtId: ObjectId | string
 *  - date: string (YYYY-MM-DD)
 *  - timeSlot: string
 *  - excludeBookingId: ObjectId | string (optional)
 *  - holdCutoff: Date (optional)
 */
function buildCourtSlotConflictQuery({ courtId, date, timeSlot, excludeBookingId, holdCutoff }) {
  const query = {
    courtId,
    date,
    timeSlot,
    $or: getActiveBookingFilter(holdCutoff),
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return query;
}

/**
 * Builds a query object to fetch active bookings for availability lists or range checks.
 *
 * Options:
 *  - courtId: ObjectId | string (optional)
 *  - arenaId: ObjectId | string (optional)
 *  - date: string | { $gte: string, $lte: string } (optional)
 *  - holdCutoff: Date (optional)
 */
function buildCourtAvailabilityQuery({ courtId, arenaId, date, timeSlot, holdCutoff } = {}) {
  const query = {
    $or: getActiveBookingFilter(holdCutoff),
  };

  if (courtId) query.courtId = courtId;
  if (arenaId) query.arenaId = arenaId;
  if (date) query.date = date;
  if (timeSlot) query.timeSlot = timeSlot;

  return query;
}

module.exports = {
  getHoldCutoff,
  getActiveBookingFilter,
  buildCourtSlotConflictQuery,
  buildCourtAvailabilityQuery,
};
