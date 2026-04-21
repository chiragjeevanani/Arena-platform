/**
 * Mongo id assigned to the staff member for arena-scoped APIs (`/api/arena-admin/*`).
 * @param {{ role?: string, assignedArena?: string } | null | undefined} user
 * @returns {string | null}
 */
export function getArenaStaffArenaId(user) {
  if (!user?.role) return null;
  if (user.role !== 'ARENA_ADMIN' && user.role !== 'RECEPTIONIST') return null;
  const id = user.assignedArena;
  if (!id || id === 'all') return null;
  return id;
}
