import { isMongoObjectId } from './mongoId';

/**
 * Court bookings created via API use Mongo ids; coaching rows use enrollments API (not here).
 */
export function shouldCancelBookingViaApi(booking, apiConfigured, hasToken) {
  if (!apiConfigured || !hasToken || !booking) return false;
  if (String(booking.kind) === 'enrollment') return false;
  if (String(booking.type || '').toLowerCase() === 'coaching') return false;
  return isMongoObjectId(booking.id);
}

/** Coaching row from `GET /api/me/enrollments` — cancel via `PATCH .../enrollments/:id/cancel`. */
export function shouldCancelEnrollmentViaApi(booking, apiConfigured, hasToken) {
  if (!apiConfigured || !hasToken || !booking) return false;
  if (String(booking.kind) !== 'enrollment') return false;
  return isMongoObjectId(String(booking.id));
}

/** Event registration from `GET /api/me/event-registrations` — cancel via `PATCH .../event-registrations/:id/cancel`. */
export function shouldCancelEventRegistrationViaApi(booking, apiConfigured, hasToken) {
  if (!apiConfigured || !hasToken || !booking) return false;
  if (String(booking.kind) !== 'event-registration') return false;
  return isMongoObjectId(String(booking.id));
}
