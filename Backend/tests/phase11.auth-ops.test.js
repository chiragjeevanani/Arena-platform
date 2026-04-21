const request = require('supertest');
const { createApp } = require('../src/app');
const { clearAuthRateLimitBuckets } = require('../src/middleware/rateLimitAuth');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const PasswordResetToken = require('../src/models/PasswordResetToken');
const AuditLog = require('../src/models/AuditLog');

describe('Phase 11 — Auth & ops hardening', () => {
  let app;

  beforeAll(() => {
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';
    process.env.AUTH_RATE_LIMIT_MAX = '100';
    process.env.PASSWORD_RESET_RETURN_TOKEN = 'true';
  });

  beforeEach(() => {
    app = createApp();
  });

  afterEach(async () => {
    await AuditLog.deleteMany({});
    await PasswordResetToken.deleteMany({});
    await RefreshToken.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/health database ping', () => {
    it('includes db up when Mongo is connected', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        service: 'arena-crm-api',
        db: 'up',
      });
    });
  });

  describe('Refresh token flow', () => {
    it('login returns refreshToken; refresh issues new access token', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'rf@test.com',
        password: 'password123',
        name: 'RF',
      });
      const login = await request(app).post('/api/auth/login').send({
        email: 'rf@test.com',
        password: 'password123',
      });
      expect(login.status).toBe(200);
      expect(login.body.token).toBeTruthy();
      expect(login.body.refreshToken).toBeTruthy();

      const me1 = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
      expect(me1.status).toBe(200);

      const refresh = await request(app).post('/api/auth/refresh').send({
        refreshToken: login.body.refreshToken,
      });
      expect(refresh.status).toBe(200);
      expect(refresh.body.token).toBeTruthy();
      expect(refresh.body.token).not.toBe(login.body.token);

      const me2 = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${refresh.body.token}`);
      expect(me2.status).toBe(200);
      expect(me2.body.user.email).toBe('rf@test.com');
    });

    it('returns 401 for invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token-not-in-db',
      });
      expect(res.status).toBe(401);
    });

    it('logout revokes refresh token', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'lo@test.com',
        password: 'password123',
        name: 'LO',
      });
      const login = await request(app).post('/api/auth/login').send({
        email: 'lo@test.com',
        password: 'password123',
      });
      const out = await request(app).post('/api/auth/logout').send({
        refreshToken: login.body.refreshToken,
      });
      expect(out.status).toBe(200);

      const refresh = await request(app).post('/api/auth/refresh').send({
        refreshToken: login.body.refreshToken,
      });
      expect(refresh.status).toBe(401);
    });
  });

  describe('Password reset', () => {
    it('resets password and writes audit log', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'pw@test.com',
        password: 'password123',
        name: 'PW',
      });
      const forgot = await request(app).post('/api/auth/forgot-password').send({ email: 'pw@test.com' });
      expect(forgot.status).toBe(200);
      expect(forgot.body.resetToken).toBeTruthy();

      const reset = await request(app).post('/api/auth/reset-password').send({
        token: forgot.body.resetToken,
        newPassword: 'newpass999',
      });
      expect(reset.status).toBe(200);

      const oldLogin = await request(app).post('/api/auth/login').send({
        email: 'pw@test.com',
        password: 'password123',
      });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app).post('/api/auth/login').send({
        email: 'pw@test.com',
        password: 'newpass999',
      });
      expect(newLogin.status).toBe(200);

      const audit = await AuditLog.findOne({ action: 'password_reset' });
      expect(audit).toBeTruthy();
      expect(String(audit.meta.userId)).toBeTruthy();
    });

    it('forgot-password returns ok without resetToken when flag is off', async () => {
      const prev = process.env.PASSWORD_RESET_RETURN_TOKEN;
      process.env.PASSWORD_RESET_RETURN_TOKEN = '';
      const localApp = createApp();
      await request(localApp).post('/api/auth/register').send({
        email: 'nop@test.com',
        password: 'password123',
        name: 'N',
      });
      const forgot = await request(localApp).post('/api/auth/forgot-password').send({ email: 'nop@test.com' });
      expect(forgot.status).toBe(200);
      expect(forgot.body.ok).toBe(true);
      expect(forgot.body.resetToken).toBeUndefined();
      process.env.PASSWORD_RESET_RETURN_TOKEN = prev;
    });
  });

  describe('Auth rate limiting', () => {
    beforeAll(() => {
      process.env.AUTH_RATE_LIMIT_WINDOW_MS = '300000';
      process.env.AUTH_RATE_LIMIT_MAX = '2';
      clearAuthRateLimitBuckets();
    });

    afterAll(() => {
      process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';
      process.env.AUTH_RATE_LIMIT_MAX = '100';
      clearAuthRateLimitBuckets();
    });

    it('returns 429 after exceeding login attempts per IP', async () => {
      const rlApp = createApp();
      const payload = { email: 'x@test.com', password: 'wrong' };
      const r1 = await request(rlApp).post('/api/auth/login').send(payload);
      const r2 = await request(rlApp).post('/api/auth/login').send(payload);
      expect([r1.status, r2.status]).toEqual(expect.arrayContaining([401]));
      const r3 = await request(rlApp).post('/api/auth/login').send(payload);
      expect(r3.status).toBe(429);
      expect(r3.body.error).toMatch(/too many/i);
    });
  });
});
