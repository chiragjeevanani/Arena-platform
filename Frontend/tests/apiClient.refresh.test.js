import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

vi.mock('../src/services/config.js', () => ({
  API_BASE_URL: 'http://test.local',
  isApiConfigured: () => true,
  getMockPaymentWebhookSecret: () => '',
}));

const lsStore = new Map();
const lsMock = {
  getItem: (k) => (lsStore.has(k) ? lsStore.get(k) : null),
  setItem: (k, v) => {
    lsStore.set(k, String(v));
  },
  removeItem: (k) => {
    lsStore.delete(k);
  },
  clear: () => {
    lsStore.clear();
  },
};

import {
  apiJson,
  getAuthToken,
  setAuthToken,
  setRefreshToken,
} from '../src/services/apiClient.js';

function jsonRes(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  });
}

describe('apiJson — 401 + refresh', () => {
  const originalLS = globalThis.localStorage;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: lsMock, configurable: true });
  });

  afterAll(() => {
    if (originalLS !== undefined) {
      Object.defineProperty(globalThis, 'localStorage', { value: originalLS, configurable: true });
    } else {
      delete globalThis.localStorage;
    }
  });

  beforeEach(() => {
    lsStore.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    lsStore.clear();
  });

  it('refreshes access token once and retries /api/auth/me', async () => {
    const responses = [
      () => jsonRes(401, { error: 'expired' }),
      () => jsonRes(200, { token: 'fresh-access' }),
      () => jsonRes(200, { user: { id: '1', email: 'a@b.co', name: 'A', role: 'CUSTOMER' } }),
    ];
    let i = 0;
    vi.stubGlobal('fetch', vi.fn(() => responses[i++]()));

    setAuthToken('stale');
    setRefreshToken('opaque-refresh');

    const data = await apiJson('/api/auth/me', { method: 'GET' });
    expect(data.user.email).toBe('a@b.co');
    expect(getAuthToken()).toBe('fresh-access');
    expect(fetch).toHaveBeenCalledTimes(3);
    const urls = fetch.mock.calls.map((c) => String(c[0]));
    expect(urls[1]).toContain('/api/auth/refresh');
  });

  it('runs a single refresh when two different endpoints return 401', async () => {
    let refreshCalls = 0;
    let nonRefresh = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        const u = String(url);
        if (u.includes('/api/auth/refresh')) {
          refreshCalls += 1;
          await new Promise((r) => setTimeout(r, 10));
          return jsonRes(200, { token: 'newtok' });
        }
        nonRefresh += 1;
        if (nonRefresh <= 2) return jsonRes(401, { error: 'jwt' });
        if (u.includes('/wallet')) return jsonRes(200, { balance: 0 });
        if (u.includes('/memberships')) return jsonRes(200, { memberships: [] });
        return jsonRes(500, { error: 'unexpected' });
      })
    );

    setAuthToken('old');
    setRefreshToken('rt');

    const [w, m] = await Promise.all([
      apiJson('/api/me/wallet', { method: 'GET' }),
      apiJson('/api/me/memberships', { method: 'GET' }),
    ]);
    expect(w.balance).toBe(0);
    expect(m.memberships).toEqual([]);
    expect(refreshCalls).toBe(1);
  });

  it('does not refresh without a refresh token', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonRes(401, { error: 'nope' })));
    setAuthToken('x');
    await expect(apiJson('/api/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('clears tokens when refresh fails', async () => {
    const responses = [
      () => jsonRes(401, { error: 'jwt' }),
      () => jsonRes(401, { error: 'bad refresh' }),
    ];
    let i = 0;
    vi.stubGlobal('fetch', vi.fn(() => responses[i++]()));

    setAuthToken('stale');
    setRefreshToken('bad-rt');

    await expect(apiJson('/api/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(getAuthToken()).toBeNull();
    expect(lsStore.get('refreshToken')).toBeUndefined();
  });
});
