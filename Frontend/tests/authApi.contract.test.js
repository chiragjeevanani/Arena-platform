import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiJsonMock = vi.hoisted(() => vi.fn());

vi.mock('../src/services/apiClient.js', () => ({
  apiJson: (...args) => apiJsonMock(...args),
}));

import { forgotPasswordRequest, resetPasswordRequest, coachRegisterRequest } from '../src/services/authApi';

describe('authApi (HTTP contract)', () => {
  beforeEach(() => {
    apiJsonMock.mockReset();
  });

  it('forgotPasswordRequest POST skipAuth', async () => {
    apiJsonMock.mockResolvedValueOnce({ ok: true });
    await forgotPasswordRequest('u@test.com');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'u@test.com' },
      skipAuth: true,
    });
  });

  it('coachRegisterRequest POST skipAuth', async () => {
    apiJsonMock.mockResolvedValueOnce({ user: { role: 'COACH' } });
    await coachRegisterRequest({ email: 'c@test.com', password: 'password123', name: 'Coach' });
    expect(apiJsonMock).toHaveBeenCalledWith('/api/auth/coach-register', {
      method: 'POST',
      body: { email: 'c@test.com', password: 'password123', name: 'Coach' },
      skipAuth: true,
    });
  });

  it('resetPasswordRequest POST skipAuth', async () => {
    apiJsonMock.mockResolvedValueOnce({ ok: true });
    await resetPasswordRequest('tok', 'newpass123');
    expect(apiJsonMock).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      body: { token: 'tok', newPassword: 'newpass123' },
      skipAuth: true,
    });
  });
});
