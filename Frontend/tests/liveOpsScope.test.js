import { describe, it, expect } from 'vitest';
import { resolveLiveOpsArenaScope, resolveLiveCmsScope } from '../src/utils/liveOpsScope';

const ARENA = '507f1f77bcf86cd799439011';

describe('resolveLiveOpsArenaScope', () => {
  it('returns live:false without API or token', () => {
    expect(
      resolveLiveOpsArenaScope(
        { role: 'ARENA_ADMIN', assignedArena: ARENA },
        { apiConfigured: false, hasToken: true, arenaIdFromQuery: null }
      )
    ).toEqual({ live: false });
    expect(
      resolveLiveOpsArenaScope(
        { role: 'SUPER_ADMIN' },
        { apiConfigured: true, hasToken: false, arenaIdFromQuery: ARENA }
      )
    ).toEqual({ live: false });
  });

  it('prefers arena staff channel over super admin query', () => {
    const r = resolveLiveOpsArenaScope(
      { role: 'ARENA_ADMIN', assignedArena: ARENA },
      { apiConfigured: true, hasToken: true, arenaIdFromQuery: 'aaaaaaaaaaaaaaaaaaaaaaaa' }
    );
    expect(r).toEqual({ live: true, channel: 'arena', arenaId: ARENA });
  });

  it('super admin uses admin channel when arenaId query is valid', () => {
    expect(
      resolveLiveOpsArenaScope(
        { role: 'SUPER_ADMIN' },
        { apiConfigured: true, hasToken: true, arenaIdFromQuery: ARENA }
      )
    ).toEqual({ live: true, channel: 'admin', arenaId: ARENA });
  });

  it('super admin without valid arenaId is not live', () => {
    expect(
      resolveLiveOpsArenaScope(
        { role: 'SUPER_ADMIN' },
        { apiConfigured: true, hasToken: true, arenaIdFromQuery: '' }
      )
    ).toEqual({ live: false });
  });
});

describe('resolveLiveCmsScope', () => {
  const ARENA = '507f1f77bcf86cd799439011';

  it('arena staff uses arena channel and scoped params', () => {
    expect(
      resolveLiveCmsScope(
        { role: 'RECEPTIONIST', assignedArena: ARENA },
        { apiConfigured: true, hasToken: true, arenaIdFromQuery: null }
      )
    ).toEqual({
      live: true,
      channel: 'arena',
      cmsListParams: { arenaId: ARENA, kind: 'event' },
    });
  });

  it('super admin without arenaId still lists global events', () => {
    expect(
      resolveLiveCmsScope(
        { role: 'SUPER_ADMIN' },
        { apiConfigured: true, hasToken: true, arenaIdFromQuery: '' }
      )
    ).toEqual({
      live: true,
      channel: 'admin',
      cmsListParams: { kind: 'event' },
    });
  });

  it('super admin with arenaId scopes CMS list', () => {
    expect(
      resolveLiveCmsScope(
        { role: 'SUPER_ADMIN' },
        { apiConfigured: true, hasToken: true, arenaIdFromQuery: ARENA }
      )
    ).toEqual({
      live: true,
      channel: 'admin',
      cmsListParams: { arenaId: ARENA, kind: 'event' },
    });
  });
});
