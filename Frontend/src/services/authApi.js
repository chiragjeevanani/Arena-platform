import { apiJson, clearAuthTokens, getRefreshToken } from './apiClient';

export function loginRequest(email, password) {
  return apiJson('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export function registerRequest({ email, password, name }) {
  return apiJson('/api/auth/register', {
    method: 'POST',
    body: { email, password, name },
    skipAuth: true,
  });
}

export function coachRegisterRequest({ email, password, name }) {
  return apiJson('/api/auth/coach-register', {
    method: 'POST',
    body: { email, password, name },
    skipAuth: true,
  });
}

export function meRequest() {
  return apiJson('/api/auth/me', { method: 'GET' });
}

/** Dev/local: requires `DEV_OTP_ENABLED=true` on the server. Otherwise returns 503. */
export function verifyOtpRequest(code) {
  return apiJson('/api/auth/verify-otp', {
    method: 'POST',
    body: { code },
    skipAuth: true,
  });
}

/** Revokes refresh token on server (best effort) and clears local auth storage. */
export function forgotPasswordRequest(email) {
  return apiJson('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuth: true,
  });
}

export function resetPasswordRequest(token, newPassword) {
  return apiJson('/api/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
    skipAuth: true,
  });
}

export async function logoutRequest() {
  const rt = getRefreshToken();
  try {
    if (rt) {
      await apiJson('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken: rt },
        skipAuth: true,
      });
    }
  } catch {
    // ignore network / 401
  } finally {
    clearAuthTokens();
  }
}
