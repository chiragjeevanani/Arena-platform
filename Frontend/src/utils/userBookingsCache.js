/**
 * Remove local-only `userBookings` rows whose ids already exist on the server
 * (court booking ids or enrollment ids), to avoid duplicates after switching to API mode.
 *
 * @param {{ bookingIds?: string[], enrollmentIds?: string[], eventRegistrationIds?: string[] }} ids
 */
export function pruneUserBookingsLocalCache(ids) {
  if (typeof localStorage === 'undefined') return;
  const set = new Set(
    [
      ...(ids.bookingIds || []), 
      ...(ids.enrollmentIds || []),
      ...(ids.eventRegistrationIds || [])
    ].map((x) => String(x))
  );
  if (set.size === 0) return;
  try {
    const raw = JSON.parse(localStorage.getItem('userBookings') || '[]');
    if (!Array.isArray(raw)) return;
    const next = raw.filter((row) => row && row.id != null && !set.has(String(row.id)));
    if (next.length !== raw.length) {
      localStorage.setItem('userBookings', JSON.stringify(next));
    }
  } catch {
    // ignore corrupt storage
  }
}
