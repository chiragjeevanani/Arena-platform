/**
 * Shared booking query utilities to enforce a single consistent definition
 * of an "active booking" across all backend controllers.
 *
 * A slot only counts as taken once payment has actually succeeded
 * ('confirmed'/'rescheduled'). A 'pending' booking (payment not yet
 * completed) never blocks other users — see markBookingPaidOnce in
 * paymentFinalizationService.js for the DB-level race-guard that still
 * prevents two payments from both confirming the same slot.
 */

function getActiveBookingFilter() {
  return [{ status: 'confirmed' }, { status: 'rescheduled' }];
}

/**
 * Builds a query object to check if a specific court slot is already actively booked.
 *
 * Options:
 *  - courtId: ObjectId | string
 *  - date: string (YYYY-MM-DD)
 *  - timeSlot: string
 *  - excludeBookingId: ObjectId | string (optional)
 */
function buildCourtSlotConflictQuery({ courtId, date, timeSlot, excludeBookingId }) {
  const query = {
    courtId,
    date,
    timeSlot,
    $or: getActiveBookingFilter(),
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
 */
function buildCourtAvailabilityQuery({ courtId, arenaId, date, timeSlot } = {}) {
  const query = {
    $or: getActiveBookingFilter(),
  };

  if (courtId) query.courtId = courtId;
  if (arenaId) query.arenaId = arenaId;
  if (date) query.date = date;
  if (timeSlot) query.timeSlot = timeSlot;

  return query;
}

/**
 * Finds a user's own not-yet-paid booking for this slot so a retried/resumed
 * checkout reuses the same Booking + can reuse the payment flow, without that
 * pending row blocking anyone else (see getActiveBookingFilter above).
 */
function findOwnResumableBooking({ userId, courtId, date, timeSlot }) {
  return {
    userId,
    courtId,
    date,
    timeSlot,
    status: 'pending',
    paymentStatus: 'pending',
  };
}

module.exports = {
  getActiveBookingFilter,
  buildCourtSlotConflictQuery,
  buildCourtAvailabilityQuery,
  findOwnResumableBooking,
};
