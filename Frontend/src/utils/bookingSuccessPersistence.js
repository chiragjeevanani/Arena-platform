import { isMongoObjectId } from './mongoId';

/**
 * Whether to append a row to `localStorage.userBookings` after /booking-success.
 * When the server already owns the record (Mongo id + API session), the dashboard
 * should use `GET /api/me/bookings` only — avoid duplicate / stale local rows.
 *
 * @param {Record<string, unknown> | null | undefined} state
 * @param {{ apiConfigured: boolean, hasToken: boolean }} ctx
 */
export function shouldPersistBookingSuccessToUserBookings(state, ctx) {
  if (!state) return false;
  const { apiConfigured, hasToken } = ctx;

  if (state.type === 'wallet_top_up') return false;

  if (state.type === 'membership') return true;

  if (state.batch) {
    const eid = state.enrollment?.id;
    if (apiConfigured && hasToken && eid != null && isMongoObjectId(String(eid))) {
      return false;
    }
    return true;
  }

  // Court bookings: with a server session the server is the only source of truth. Saving a
  // local row here produced an incomplete "booking" (no court / date / time) whenever the
  // success page lost its checkout details on the way back from the bank.
  if (apiConfigured && hasToken) return false;
  const bid = state.booking?.id;
  if (bid != null && isMongoObjectId(String(bid))) {
    return false;
  }

  return true;
}
