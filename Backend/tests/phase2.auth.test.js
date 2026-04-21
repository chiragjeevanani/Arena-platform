const request = require('supertest');
const { createApp } = require('../src/app');
const User = require('../src/models/User');

describe('Phase 2 — Auth (JWT)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 and public user fields for a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'Player@Example.com',
          password: 'password123',
          name: 'Test Player',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        email: 'player@example.com',
        name: 'Test Player',
        role: 'CUSTOMER',
      });
      expect(res.body.user.id).toBeTruthy();
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('returns 409 when email already exists', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'dup@test.com',
        password: 'password123',
        name: 'First',
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'dup@test.com',
        password: 'otherpass12',
        name: 'Second',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/exists/i);
    });

    it('returns 400 when validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'short', name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login User',
      });
    });

    it('returns 200, JWT, and user on valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.split('.')).toHaveLength(3);
      expect(res.body.user).toMatchObject({
        email: 'login@test.com',
        role: 'CUSTOMER',
      });
    });

    it('returns 401 on wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
    });

    it('returns 401 for unknown email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without Authorization header', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 200 and user when Bearer token is valid', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'me@test.com',
        password: 'password123',
        name: 'Me User',
      });

      const login = await request(app).post('/api/auth/login').send({
        email: 'me@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${login.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        email: 'me@test.com',
        name: 'Me User',
        role: 'CUSTOMER',
      });
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let prevDev;
    let prevCode;

    beforeEach(() => {
      prevDev = process.env.DEV_OTP_ENABLED;
      prevCode = process.env.DEV_OTP_CODE;
    });

    afterEach(() => {
      process.env.DEV_OTP_ENABLED = prevDev;
      process.env.DEV_OTP_CODE = prevCode;
    });

    it('returns 503 when SMS OTP is not enabled', async () => {
      delete process.env.DEV_OTP_ENABLED;
      const res = await request(app).post('/api/auth/verify-otp').send({ code: '1234' });
      expect(res.status).toBe(503);
      expect(res.body.error).toBeTruthy();
    });

    it('returns 200 when DEV_OTP_ENABLED and code matches', async () => {
      process.env.DEV_OTP_ENABLED = 'true';
      process.env.DEV_OTP_CODE = '1234';
      const res = await request(app).post('/api/auth/verify-otp').send({ code: '1234' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('returns 400 when code does not match', async () => {
      process.env.DEV_OTP_ENABLED = 'true';
      process.env.DEV_OTP_CODE = '1234';
      const res = await request(app).post('/api/auth/verify-otp').send({ code: '9999' });
      expect(res.status).toBe(400);
    });
  });
});
