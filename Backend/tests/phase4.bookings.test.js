const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const Court = require('../src/models/Court');
const Booking = require('../src/models/Booking');

async function customerToken(app) {
  await request(app).post('/api/auth/register').send({
    email: 'booker@test.com',
    password: 'password123',
    name: 'Booker',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'booker@test.com',
    password: 'password123',
  });
  return login.body.token;
}

async function superToken(app) {
  const passwordHash = await bcrypt.hash('adminpass123', 10);
  await User.create({
    email: 'super2@test.com',
    passwordHash,
    name: 'Super',
    role: 'SUPER_ADMIN',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'super2@test.com',
    password: 'adminpass123',
  });
  return login.body.token;
}

describe('Phase 4 — Bookings & court availability', () => {
  let app;
  let arena;
  let court;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await Booking.deleteMany({});
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  async function seedArenaCourt() {
    arena = await Arena.create({
      name: 'Test Arena',
      location: 'Muscat',
      pricePerHour: 5,
      isPublished: true,
    });
    court = await Court.create({
      arenaId: arena._id,
      name: 'Court 1',
      type: 'Wooden',
    });
  }

  describe('POST /api/me/bookings', () => {
    it('returns 401 without token', async () => {
      await seedArenaCourt();
      const res = await request(app).post('/api/me/bookings').send({
        arenaId: arena._id.toString(),
        courtId: court._id.toString(),
        date: '2026-06-01',
        timeSlot: '07:00 PM - 08:00 PM',
        amount: 5,
      });
      expect(res.status).toBe(401);
    });

    it('returns 403 for SUPER_ADMIN (not customer)', async () => {
      await seedArenaCourt();
      const token = await superToken(app);
      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-06-01',
          timeSlot: '07:00 PM - 08:00 PM',
          amount: 5,
        });
      expect(res.status).toBe(403);
    });

    it('returns 400 when required fields missing', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2026-06-01' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when court does not exist', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: fakeId,
          date: '2026-06-01',
          timeSlot: '07:00 PM - 08:00 PM',
          amount: 5,
        });
      expect(res.status).toBe(404);
    });

    it('returns 400 when court does not belong to arena', async () => {
      await seedArenaCourt();
      const arena2 = await Arena.create({
        name: 'Other',
        location: 'X',
        pricePerHour: 3,
        isPublished: true,
      });
      const token = await customerToken(app);
      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena2._id.toString(),
          courtId: court._id.toString(),
          date: '2026-06-01',
          timeSlot: '07:00 PM - 08:00 PM',
          amount: 5,
        });
      expect(res.status).toBe(400);
    });

    it('returns 201 and booking on valid payload', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-06-01',
          timeSlot: '07:00 PM - 08:00 PM',
          amount: 5,
          paymentMethod: 'online',
        });
      expect(res.status).toBe(201);
      expect(res.body.booking).toMatchObject({
        date: '2026-06-01',
        timeSlot: '07:00 PM - 08:00 PM',
        status: 'confirmed',
        amount: 5,
      });
      expect(res.body.booking.id).toBeTruthy();
    });

    it('returns 409 when same slot is already booked', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const body = {
        arenaId: arena._id.toString(),
        courtId: court._id.toString(),
        date: '2026-06-02',
        timeSlot: '08:00 PM - 09:00 PM',
        amount: 5,
      };
      const first = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
      expect(first.status).toBe(201);
      const second = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
      expect(second.status).toBe(409);
    });
  });

  describe('GET /api/me/bookings', () => {
    it('returns list for customer', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-06-03',
          timeSlot: '06:00 PM - 07:00 PM',
          amount: 5,
        });
      const res = await request(app)
        .get('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.bookings)).toBe(true);
      expect(res.body.bookings).toHaveLength(1);
    });
  });

  describe('PATCH /api/me/bookings/:id/cancel', () => {
    it('allows owner to cancel then book same slot again', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const body = {
        arenaId: arena._id.toString(),
        courtId: court._id.toString(),
        date: '2026-06-04',
        timeSlot: '05:00 PM - 06:00 PM',
        amount: 5,
      };
      const created = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
      const id = created.body.booking.id;
      const cancel = await request(app)
        .patch(`/api/me/bookings/${id}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      expect(cancel.status).toBe(200);
      expect(cancel.body.booking.status).toBe('cancelled');
      const again = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(body);
      expect(again.status).toBe(201);
    });
  });

  describe('Admin bookings', () => {
    it('GET /api/admin/bookings lists bookings for SUPER_ADMIN', async () => {
      await seedArenaCourt();
      const custToken = await customerToken(app);
      await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${custToken}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-06-05',
          timeSlot: '04:00 PM - 05:00 PM',
          amount: 5,
        });
      const adminToken = await superToken(app);
      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/admin/bookings/:id updates status', async () => {
      await seedArenaCourt();
      const custToken = await customerToken(app);
      const created = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${custToken}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-06-06',
          timeSlot: '03:00 PM - 04:00 PM',
          amount: 5,
        });
      const id = created.body.booking.id;
      const adminToken = await superToken(app);
      const res = await request(app)
        .patch(`/api/admin/bookings/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });
      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe('completed');
    });
  });

  describe('GET /api/public/courts/:courtId/availability', () => {
    it('returns slots with booked false for empty day', async () => {
      await seedArenaCourt();
      const res = await request(app).get(
        `/api/public/courts/${court._id}/availability?date=2026-07-01`
      );
      expect(res.status).toBe(200);
      expect(res.body.date).toBe('2026-07-01');
      expect(Array.isArray(res.body.slots)).toBe(true);
      expect(res.body.slots.length).toBeGreaterThan(0);
      expect(res.body.slots.every((s) => 'timeSlot' in s && 'available' in s)).toBe(true);
    });

    it('marks booked slot unavailable', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const timeSlot = '09:00 PM - 10:00 PM';
      await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-07-02',
          timeSlot,
          amount: 5,
        });
      const res = await request(app).get(
        `/api/public/courts/${court._id}/availability?date=2026-07-02`
      );
      const slot = res.body.slots.find((s) => s.timeSlot === timeSlot);
      expect(slot).toBeTruthy();
      expect(slot.available).toBe(false);
    });
  });
});
