const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const Court = require('../src/models/Court');
const Booking = require('../src/models/Booking');
const MembershipPlan = require('../src/models/MembershipPlan');
const CoachingBatch = require('../src/models/CoachingBatch');
const InventoryItem = require('../src/models/InventoryItem');
const CmsContent = require('../src/models/CmsContent');

async function superToken(app) {
  const passwordHash = await bcrypt.hash('super8pass', 10);
  await User.create({
    email: 'super8@test.com',
    passwordHash,
    name: 'Super8',
    role: 'SUPER_ADMIN',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'super8@test.com',
    password: 'super8pass',
  });
  return login.body.token;
}

async function staffToken(app, { email, role, assignedArenaId }) {
  const passwordHash = await bcrypt.hash('staff8pass', 10);
  await User.create({
    email,
    passwordHash,
    name: 'Staff',
    role,
    assignedArenaId: assignedArenaId ? String(assignedArenaId) : null,
  });
  const login = await request(app).post('/api/auth/login').send({
    email,
    password: 'staff8pass',
  });
  return login.body.token;
}

describe('Phase 8 — Arena-scoped staff (ARENA_ADMIN / RECEPTIONIST)', () => {
  let app;
  let arenaA;
  let arenaB;
  let courtA;
  let coach;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await CmsContent.deleteMany({});
    await InventoryItem.deleteMany({});
    await CoachingBatch.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Booking.deleteMany({});
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    arenaA = await Arena.create({
      name: 'Arena A',
      location: 'A',
      pricePerHour: 10,
      isPublished: true,
    });
    arenaB = await Arena.create({
      name: 'Arena B',
      location: 'B',
      pricePerHour: 8,
      isPublished: true,
    });
    courtA = await Court.create({ arenaId: arenaA._id, name: 'C1', type: 'Wood' });
    const coachHash = await bcrypt.hash('coach8pass', 10);
    coach = await User.create({
      email: 'coach8@test.com',
      passwordHash: coachHash,
      name: 'Coach8',
      role: 'COACH',
    });
  });

  it('returns 401 without token for arena-admin bookings', async () => {
    const res = await request(app).get(`/api/arena-admin/bookings?arenaId=${arenaA._id}`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for CUSTOMER on arena-admin', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'cust8@test.com',
      password: 'password123',
      name: 'Cust',
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'cust8@test.com',
      password: 'password123',
    });
    const res = await request(app)
      .get(`/api/arena-admin/bookings?arenaId=${arenaA._id}`)
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 for SUPER_ADMIN on arena-admin (use /api/admin)', async () => {
    const token = await superToken(app);
    const res = await request(app)
      .get(`/api/arena-admin/bookings?arenaId=${arenaA._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 when staff has no assigned arena', async () => {
    const token = await staffToken(app, {
      email: 'narena@test.com',
      role: 'ARENA_ADMIN',
      assignedArenaId: null,
    });
    const res = await request(app)
      .get(`/api/arena-admin/bookings?arenaId=${arenaA._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 when query arenaId does not match assignment', async () => {
    const token = await staffToken(app, {
      email: 'aa@test.com',
      role: 'ARENA_ADMIN',
      assignedArenaId: arenaA._id,
    });
    const res = await request(app)
      .get(`/api/arena-admin/bookings?arenaId=${arenaB._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('ARENA_ADMIN lists bookings for assigned arena', async () => {
    const custHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      email: 'booker8@test.com',
      passwordHash: custHash,
      name: 'Booker',
      role: 'CUSTOMER',
    });
    await Booking.create({
      userId: customer._id,
      arenaId: arenaA._id,
      courtId: courtA._id,
      date: '2026-11-01',
      timeSlot: '06:00 PM - 07:00 PM',
      amount: 10,
      status: 'confirmed',
    });

    const token = await staffToken(app, {
      email: 'aa2@test.com',
      role: 'ARENA_ADMIN',
      assignedArenaId: arenaA._id,
    });
    const res = await request(app)
      .get(`/api/arena-admin/bookings?arenaId=${arenaA._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
  });

  it('RECEPTIONIST can PATCH booking in assigned arena', async () => {
    const custHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      email: 'booker9@test.com',
      passwordHash: custHash,
      name: 'B',
      role: 'CUSTOMER',
    });
    const b = await Booking.create({
      userId: customer._id,
      arenaId: arenaA._id,
      courtId: courtA._id,
      date: '2026-11-02',
      timeSlot: '07:00 PM - 08:00 PM',
      amount: 10,
      status: 'confirmed',
    });

    const token = await staffToken(app, {
      email: 'rec@test.com',
      role: 'RECEPTIONIST',
      assignedArenaId: arenaA._id,
    });
    const res = await request(app)
      .patch(`/api/arena-admin/bookings/${b._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('completed');
  });

  it('returns 403 when PATCH booking belongs to another arena', async () => {
    const courtB = await Court.create({ arenaId: arenaB._id, name: 'CB', type: 'X' });
    const custHash = await bcrypt.hash('password123', 10);
    const customer = await User.create({
      email: 'booker10@test.com',
      passwordHash: custHash,
      name: 'B2',
      role: 'CUSTOMER',
    });
    const b = await Booking.create({
      userId: customer._id,
      arenaId: arenaB._id,
      courtId: courtB._id,
      date: '2026-11-03',
      timeSlot: '08:00 PM - 09:00 PM',
      amount: 8,
      status: 'confirmed',
    });

    const token = await staffToken(app, {
      email: 'aa3@test.com',
      role: 'ARENA_ADMIN',
      assignedArenaId: arenaA._id,
    });
    const res = await request(app)
      .patch(`/api/arena-admin/bookings/${b._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(403);
  });

  it('ARENA_ADMIN creates membership plan only for assigned arena', async () => {
    const token = await staffToken(app, {
      email: 'aa4@test.com',
      role: 'ARENA_ADMIN',
      assignedArenaId: arenaA._id,
    });
    const ok = await request(app)
      .post('/api/arena-admin/membership-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        arenaId: arenaA._id.toString(),
        name: 'Plan',
        price: 50,
        durationDays: 30,
        discountPercent: 5,
      });
    expect(ok.status).toBe(201);

    const bad = await request(app)
      .post('/api/arena-admin/membership-plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        arenaId: arenaB._id.toString(),
        name: 'Bad',
        price: 1,
        durationDays: 1,
        discountPercent: 0,
      });
    expect(bad.status).toBe(403);
  });
});
