import { getArenaStaffArenaId } from './arenaStaffScope';
import { isMongoObjectId } from './mongoId';

/**
 * Decide whether Inventory/POS should use live APIs and which arena id to scope.
 * - Arena staff: assigned arena (JWT + /api/arena-admin).
 * - Super admin: optional `?arenaId=` on the URL (/api/admin).
 *
 * @param {{ role?: string, assignedArena?: string } | null | undefined} user
 * @param {{ apiConfigured: boolean, hasToken: boolean, arenaIdFromQuery?: string | null }} opts
 * @returns {{ live: false } | { live: true, channel: 'arena' | 'admin', arenaId: string }}
 */
export function resolveLiveOpsArenaScope(user, opts) {
  const { apiConfigured, hasToken, arenaIdFromQuery } = opts;
  if (!apiConfigured || !hasToken) {
    return { live: false };
  }

  const staffArena = getArenaStaffArenaId(user);
  if (staffArena && isMongoObjectId(staffArena)) {
    return { live: true, channel: 'arena', arenaId: staffArena };
  }

  if (user?.role === 'SUPER_ADMIN') {
    const q = (arenaIdFromQuery || '').trim();
    if (q && isMongoObjectId(q)) {
      return { live: true, channel: 'admin', arenaId: q };
    }
  }

  return { live: false };
}

/**
 * CMS list for Events admin: arena staff stays scoped; super admin may pass `?arenaId=` or list all `kind=event`.
 *
 * @param {{ role?: string, assignedArena?: string } | null | undefined} user
 * @param {{ apiConfigured: boolean, hasToken: boolean, arenaIdFromQuery?: string | null }} opts
 * @returns {{ live: false } | { live: true, channel: 'arena' | 'admin', cmsListParams: { kind: string, arenaId?: string } }}
 */
export function resolveLiveCmsScope(user, opts) {
  const { apiConfigured, hasToken, arenaIdFromQuery } = opts;
  if (!apiConfigured || !hasToken) {
    return { live: false };
  }

  const staffArena = getArenaStaffArenaId(user);
  if (staffArena && isMongoObjectId(staffArena)) {
    return {
      live: true,
      channel: 'arena',
      cmsListParams: { arenaId: staffArena, kind: 'event' },
    };
  }

  if (user?.role === 'SUPER_ADMIN') {
    const q = (arenaIdFromQuery || '').trim();
    if (q && isMongoObjectId(q)) {
      return {
        live: true,
        channel: 'admin',
        cmsListParams: { arenaId: q, kind: 'event' },
      };
    }
    return {
      live: true,
      channel: 'admin',
      cmsListParams: { kind: 'event' },
    };
  }

  return { live: false };
}
