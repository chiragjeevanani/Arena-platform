import { API_BASE_URL } from './config';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/** Same-key GETs in flight coalesce (helps React StrictMode dev double-mount). */
const inFlightGet = new Map();

/** Coalesce concurrent 401→refresh attempts. */
let refreshInFlight = null;

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function shouldAttempt401Refresh(path, skipAuth, retriedAfter401) {
  if (skipAuth || retriedAfter401) return false;
  if (path === '/api/auth/me') return true;
  if (path.startsWith('/api/auth/')) return false;
  return true;
}

async function parseJsonResponse(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || 'Invalid JSON' };
  }
  return { data, text };
}

async function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const rt = getRefreshToken();
        if (!rt) {
          throw new Error('No refresh token');
        }
        if (!API_BASE_URL) {
          throw new Error('VITE_API_URL is not set');
        }
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: rt }),
        });
        const { data } = await parseJsonResponse(res);
        if (!res.ok) {
          const msg = (data && (data.error || data.message)) || res.statusText || 'Refresh failed';
          const err = new Error(typeof msg === 'string' ? msg : 'Refresh failed');
          err.status = res.status;
          err.body = data;
          throw err;
        }
        if (!data?.token) {
          const err = new Error('Invalid refresh response');
          err.status = res.status;
          throw err;
        }
        setAuthToken(data.token);
        return data.token;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/**
 * JSON API call. Throws Error with .status and .body on failure.
 * On 401 (except auth endpoints), attempts one access-token refresh when a refresh token exists.
 */
export async function apiJson(path, options = {}) {
  const {
    method = 'GET',
    body,
    skipAuth = false,
    headers: extraHeaders = {},
    _retriedAfter401 = false,
  } = options;
  /** Only dedupe unauthenticated GETs — authed GETs may 401→refresh and must not share one rejectable promise. */
  const dedupeKey =
    skipAuth &&
    method === 'GET' &&
    (body === undefined || body === null) &&
    !_retriedAfter401
      ? `0:${path}`
      : null;

  if (dedupeKey) {
    const pending = inFlightGet.get(dedupeKey);
    if (pending) return pending;
  }

  const run = (async () => {
    if (!API_BASE_URL) {
      const err = new Error('VITE_API_URL is not set');
      err.status = 0;
      throw err;
    }

    const headers = { Accept: 'application/json', ...extraHeaders };
    if (body !== undefined && body !== null) {
      headers['Content-Type'] = 'application/json';
    }
    if (!skipAuth) {
      const t = getAuthToken();
      if (t) headers.Authorization = `Bearer ${t}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    const { data } = await parseJsonResponse(res);

    if (res.status === 401 && shouldAttempt401Refresh(path, skipAuth, _retriedAfter401)) {
      const rt = getRefreshToken();
      if (rt) {
        try {
          await refreshAccessToken();
          return apiJson(path, { ...options, _retriedAfter401: true });
        } catch {
          clearAuthTokens();
        }
      }
    }

    if (!res.ok) {
      const msg =
        (data && (data.error || data.message)) || res.statusText || 'Request failed';
      const err = new Error(typeof msg === 'string' ? msg : 'Request failed');
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  })();

  if (dedupeKey) {
    inFlightGet.set(dedupeKey, run);
    run.finally(() => {
      if (inFlightGet.get(dedupeKey) === run) inFlightGet.delete(dedupeKey);
    });
  }

  return run;
}

export async function apiMultipart(path, formData, options = {}) {
  if (!API_BASE_URL) {
    const err = new Error('VITE_API_URL is not set');
    err.status = 0;
    throw err;
  }
  const headers = {};
  const t = getAuthToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'POST',
    headers,
    body: formData,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text || 'Invalid JSON' }; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText || 'Upload failed';
    const err = new Error(typeof msg === 'string' ? msg : 'Upload failed');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
