const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const Court = require('../src/models/Court');
const CoachingBatch = require('../src/models/CoachingBatch');
const BatchEnrollment = require('../src/models/BatchEnrollment');
const Booking = require('../src/models/Booking');
const PosSale = require('../src/models/PosSale');
const Sponsor = require('../src/models/Sponsor');
const CoachingAttendance = require('../src/models/CoachingAttendance');

describe('Phase 12 — Coach signup, attendance, admin users/reports/sponsors, me profile', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await CoachingAttendance.deleteMany({});
    await Sponsor.deleteMany({});
    await BatchEnrollment.deleteMany({});
    await CoachingBatch.deleteMany({});
    await PosSale.deleteMany({});
    await Booking.deleteMany({});
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
    delete process.env.ALLOW_COACH_SELF_REGISTER;
  });

  it('POST /api/auth/coach-register creates COACH', async () => {
    const res = await request(app).post('/api/auth/coach-register').send({
      email: 'newcoach@test.com',
      password: 'password123',
      name: 'Line Coach',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('COACH');
    const login = await request(app).post('/api/auth/login').send({
      email: 'newcoach@test.com',
      password: 'password123',
    });
    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe('COACH');
  });

  it('POST /api/auth/coach-register 403 when disabled', async () => {
    process.env.ALLOW_COACH_SELF_REGISTER = 'false';
    const res = await request(app).post('/api/auth/coach-register').send({
      email: 'blocked@test.com',
      password: 'password123',
      name: 'X',
    });
    expect(res.status).toBe(403);
  });

  it('coach lists students and saves attendance', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const coach = await User.create({
      email: 'c12@test.com',
      passwordHash,
      name: 'Coach12',
      role: 'COACH',
    });
    const cust = await User.create({
      email: 'stu12@test.com',
      passwordHash,
      name: 'Student12',
      role: 'CUSTOMER',
    });
    const arena = await Arena.create({
      name: 'A12',
      location: 'L',
      pricePerHour: 10,
      isPublished: true,
    });
    const batch = await CoachingBatch.create({
      arenaId: arena._id,
      coachId: coach._id,
      title: 'Batch A',
      capacity: 10,
      price: 0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isPublished: true,
    });
    await BatchEnrollment.create({
      batchId: batch._id,
      userId: cust._id,
      status: 'confirmed',
    });

    const coachLogin = await request(app).post('/api/auth/login').send({
      email: 'c12@test.com',
      password: 'password123',
    });
    const tok = coachLogin.body.token;

    const st = await request(app)
      .get(`/api/coach/batches/${batch._id}/students`)
      .set('Authorization', `Bearer ${tok}`);
    expect(st.status).toBe(200);
    expect(st.body.students).toHaveLength(1);

    const up = await request(app)
      .put(`/api/coach/batches/${batch._id}/attendance`)
      .set('Authorization', `Bearer ${tok}`)
      .send({
        sessionDate: '2026-04-10',
        records: [{ userId: cust._id.toString(), status: 'present' }],
      });
    expect(up.status).toBe(200);
    expect(up.body.attendance.sessionDate).toBe('2026-04-10');

    const hist = await request(app)
      .get('/api/coach/attendance-history?from=2026-04-01&to=2026-04-30')
      .set('Authorization', `Bearer ${tok}`);
    expect(hist.status).toBe(200);
    expect(hist.body.sessions.length).toBeGreaterThanOrEqual(1);
  });

  it('customer reads own attendance for month', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const coach = await User.create({
      email: 'c13@test.com',
      passwordHash,
      name: 'Coach13',
      role: 'COACH',
    });
    const cust = await User.create({
      email: 'cust13@test.com',
      passwordHash,
      name: 'Cust13',
      role: 'CUSTOMER',
    });
    const arena = await Arena.create({
      name: 'A13',
      location: 'L',
      pricePerHour: 10,
      isPublished: true,
    });
    const batch = await CoachingBatch.create({
      arenaId: arena._id,
      coachId: coach._id,
      title: 'B13',
      capacity: 5,
      price: 0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isPublished: true,
    });
    await BatchEnrollment.create({
      batchId: batch._id,
      userId: cust._id,
      status: 'confirmed',
    });
    await CoachingAttendance.create({
      batchId: batch._id,
      sessionDate: '2026-05-01',
      records: [{ userId: cust._id, status: 'late' }],
    });

    const login = await request(app).post('/api/auth/login').send({
      email: 'cust13@test.com',
      password: 'password123',
    });
    const me = await request(app)
      .get('/api/me/attendance?month=2026-05')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.sessions).toHaveLength(1);
    expect(me.body.sessions[0].status).toBe('late');
  });

  it('PATCH /api/me/profile updates customer', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'prof@test.com',
      password: 'password123',
      name: 'Prof',
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'prof@test.com',
      password: 'password123',
    });
    const res = await request(app)
      .patch('/api/me/profile')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ name: 'Prof II', phone: '999' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Prof II');
    expect(res.body.user.phone).toBe('999');
  });

  it('admin users and sponsors and report summary', async () => {
    const passwordHash = await bcrypt.hash('superpass', 10);
    const superU = await User.create({
      email: 'super12@test.com',
      passwordHash,
      name: 'Super12',
      role: 'SUPER_ADMIN',
    });
    await User.create({
      email: 'staff12@test.com',
      passwordHash,
      name: 'Staff',
      role: 'RECEPTIONIST',
      assignedArenaId: null,
    });
    const arena = await Arena.create({
      name: 'RepA',
      location: 'L',
      pricePerHour: 12,
      isPublished: true,
    });
    const court = await Court.create({
      arenaId: arena._id,
      name: 'C1',
      type: 'Wooden',
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'super12@test.com',
      password: 'superpass',
    });
    const tok = login.body.token;

    const users = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${tok}`);
    expect(users.status).toBe(200);
    expect(users.body.total).toBeGreaterThanOrEqual(2);

    const sp = await request(app)
      .post('/api/admin/sponsors')
      .set('Authorization', `Bearer ${tok}`)
      .send({ name: 'Acme', equity: 1000, status: 'Active' });
    expect(sp.status).toBe(201);
    const list = await request(app).get('/api/admin/sponsors').set('Authorization', `Bearer ${tok}`);
    expect(list.body.sponsors).toHaveLength(1);

    await Booking.create({
      userId: superU._id,
      arenaId: arena._id,
      courtId: court._id,
      date: '2026-06-15',
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'confirmed',
      amount: 20,
      paymentStatus: 'paid',
      paymentMethod: 'wallet',
    });
    const rep = await request(app)
      .get(`/api/admin/reports/summary?arenaId=${arena._id}&from=2026-06-01&to=2026-06-30`)
      .set('Authorization', `Bearer ${tok}`);
    expect(rep.status).toBe(200);
    expect(rep.body.bookings.confirmedOrCompleted).toBe(1);
    expect(rep.body.bookings.revenueAmount).toBe(20);
  });
});
