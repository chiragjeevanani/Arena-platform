const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const Court = require('../src/models/Court');
const Booking = require('../src/models/Booking');
const MembershipPlan = require('../src/models/MembershipPlan');
const UserMembership = require('../src/models/UserMembership');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');

async function customerToken(app) {
  await request(app).post('/api/auth/register').send({
    email: 'member@test.com',
    password: 'password123',
    name: 'Member',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'member@test.com',
    password: 'password123',
  });
  return login.body.token;
}

async function superToken(app) {
  const passwordHash = await bcrypt.hash('adminpass456', 10);
  await User.create({
    email: 'super5@test.com',
    passwordHash,
    name: 'Super5',
    role: 'SUPER_ADMIN',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'super5@test.com',
    password: 'adminpass456',
  });
  return login.body.token;
}

describe('Phase 5 — Membership & wallet', () => {
  let app;
  let arena;
  let court;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await WalletTransaction.deleteMany({});
    await UserMembership.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Wallet.deleteMany({});
    await Booking.deleteMany({});
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  async function seedArenaCourt() {
    arena = await Arena.create({
      name: 'Wallet Arena',
      location: 'Muscat',
      pricePerHour: 100,
      isPublished: true,
    });
    court = await Court.create({
      arenaId: arena._id,
      name: 'Court A',
      type: 'Synthetic',
    });
  }

  describe('Admin membership plans', () => {
    it('creates and lists plans for an arena', async () => {
      await seedArenaCourt();
      const admin = await superToken(app);
      const created = await request(app)
        .post('/api/admin/membership-plans')
        .set('Authorization', `Bearer ${admin}`)
        .send({
          arenaId: arena._id.toString(),
          name: 'Gold',
          price: 500,
          durationDays: 30,
          discountPercent: 10,
        });
      expect(created.status).toBe(201);
      expect(created.body.plan.name).toBe('Gold');
      expect(created.body.plan.discountPercent).toBe(10);

      const list = await request(app)
        .get(`/api/admin/membership-plans?arenaId=${arena._id}`)
        .set('Authorization', `Bearer ${admin}`);
      expect(list.status).toBe(200);
      expect(list.body.plans).toHaveLength(1);
    });
  });

  describe('Public membership plans', () => {
    it('lists active plans for a published arena', async () => {
      await seedArenaCourt();
      await MembershipPlan.create({
        arenaId: arena._id,
        name: 'Silver',
        price: 200,
        durationDays: 7,
        discountPercent: 5,
        isActive: true,
      });
      const res = await request(app).get(`/api/public/arenas/${arena._id}/membership-plans`);
      expect(res.status).toBe(200);
      expect(res.body.plans).toHaveLength(1);
      expect(res.body.plans[0].name).toBe('Silver');
    });

    it('returns 404 for unpublished arena', async () => {
      const a = await Arena.create({
        name: 'Draft',
        location: 'X',
        pricePerHour: 1,
        isPublished: false,
      });
      await MembershipPlan.create({
        arenaId: a._id,
        name: 'Hidden',
        price: 1,
        durationDays: 1,
        discountPercent: 0,
        isActive: true,
      });
      const res = await request(app).get(`/api/public/arenas/${a._id}/membership-plans`);
      expect(res.status).toBe(404);
    });
  });

  describe('Wallet', () => {
    it('tops up and returns wallet with transactions', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      const top = await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 750 });
      expect(top.status).toBe(201);
      expect(top.body.wallet.balance).toBe(750);

      const get = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
      expect(get.status).toBe(200);
      expect(get.body.wallet.balance).toBe(750);
      expect(get.body.transactions).toHaveLength(1);
      expect(get.body.transactions[0].reason).toBe('top_up');
    });
  });

  describe('Membership purchase', () => {
    it('deducts wallet and creates membership', async () => {
      await seedArenaCourt();
      const plan = await MembershipPlan.create({
        arenaId: arena._id,
        name: 'Weekly',
        price: 300,
        durationDays: 7,
        discountPercent: 20,
        isActive: true,
      });
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 400 });

      const buy = await request(app)
        .post('/api/me/memberships/purchase')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: plan._id.toString() });
      expect(buy.status).toBe(201);
      expect(buy.body.membership.planName).toBe('Weekly');
      expect(buy.body.wallet.balance).toBe(100);

      const list = await request(app).get('/api/me/memberships').set('Authorization', `Bearer ${token}`);
      expect(list.status).toBe(200);
      expect(list.body.memberships).toHaveLength(1);
    });

    it('returns 400 when balance is insufficient', async () => {
      await seedArenaCourt();
      const plan = await MembershipPlan.create({
        arenaId: arena._id,
        name: 'Premium',
        price: 999,
        durationDays: 30,
        discountPercent: 15,
        isActive: true,
      });
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 10 });

      const buy = await request(app)
        .post('/api/me/memberships/purchase')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: plan._id.toString() });
      expect(buy.status).toBe(400);
      expect(buy.body.error).toMatch(/Insufficient/i);
    });
  });

  describe('Booking pricing & wallet payment', () => {
    it('applies membership discount to court booking amount', async () => {
      await seedArenaCourt();
      const plan = await MembershipPlan.create({
        arenaId: arena._id,
        name: 'VIP',
        price: 1,
        durationDays: 365,
        discountPercent: 25,
        isActive: true,
      });
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100 });
      await request(app)
        .post('/api/me/memberships/purchase')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: plan._id.toString() });

      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-08-01',
          timeSlot: '06:00 PM - 07:00 PM',
          amount: 75,
        });
      expect(res.status).toBe(201);
      expect(res.body.pricing.finalAmount).toBe(75);
      expect(res.body.booking.amount).toBe(75);
    });

    it('pays with wallet and records debit transaction', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 200 });

      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-08-02',
          timeSlot: '07:00 PM - 08:00 PM',
          amount: 100,
          paymentMethod: 'wallet',
        });
      expect(res.status).toBe(201);
      expect(res.body.booking.amount).toBe(100);

      const w = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
      expect(w.body.wallet.balance).toBe(100);
      const debits = w.body.transactions.filter((t) => t.reason === 'booking_payment');
      expect(debits).toHaveLength(1);
    });

    it('returns 400 when wallet balance is too low for booking', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 50 });

      const res = await request(app)
        .post('/api/me/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          arenaId: arena._id.toString(),
          courtId: court._id.toString(),
          date: '2026-08-03',
          timeSlot: '08:00 PM - 09:00 PM',
          amount: 100,
          paymentMethod: 'wallet',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Insufficient/i);
    });

    it('refunds wallet when slot is already taken (wallet payment)', async () => {
      await seedArenaCourt();
      const token = await customerToken(app);
      await request(app)
        .post('/api/me/wallet/top-up')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 500 });

      const body = {
        arenaId: arena._id.toString(),
        courtId: court._id.toString(),
        date: '2026-08-04',
        timeSlot: '09:00 PM - 10:00 PM',
        amount: 100,
        paymentMethod: 'wallet',
      };
      const first = await request(app).post('/api/me/bookings').set('Authorization', `Bearer ${token}`).send(body);
      expect(first.status).toBe(201);
      const second = await request(app).post('/api/me/bookings').set('Authorization', `Bearer ${token}`).send(body);
      expect(second.status).toBe(409);

      const w = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
      expect(w.body.wallet.balance).toBe(400);
    });
  });
});
