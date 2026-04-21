const request = require('supertest');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const Court = require('../src/models/Court');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');

async function customerToken(app) {
  await request(app).post('/api/auth/register').send({
    email: 'fin10@test.com',
    password: 'password123',
    name: 'Fin',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'fin10@test.com',
    password: 'password123',
  });
  return login.body.token;
}

describe('Phase 10 — Wallet refund on booking cancel', () => {
  let app;
  let arena;
  let court;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await WalletTransaction.deleteMany({});
    await Wallet.deleteMany({});
    await require('../src/models/Booking').deleteMany({});
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    arena = await Arena.create({
      name: 'Refund Arena',
      location: 'R',
      pricePerHour: 25,
      isPublished: true,
    });
    court = await Court.create({ arenaId: arena._id, name: 'RC', type: 'Wood' });
  });

  it('credits wallet when customer cancels a wallet-paid booking', async () => {
    const token = await customerToken(app);
    const user = await User.findOne({ email: 'fin10@test.com' });

    await request(app)
      .post('/api/me/wallet/top-up')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 200 });

    const book = await request(app)
      .post('/api/me/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        arenaId: arena._id.toString(),
        courtId: court._id.toString(),
        date: '2026-12-01',
        timeSlot: '06:00 PM - 07:00 PM',
        amount: 25,
        paymentMethod: 'wallet',
      });
    expect(book.status).toBe(201);
    const bookingId = book.body.booking.id;

    const mid = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
    expect(mid.body.wallet.balance).toBe(175);

    const cancel = await request(app)
      .patch(`/api/me/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.booking.status).toBe('cancelled');

    const after = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
    expect(after.body.wallet.balance).toBe(200);

    const refunds = after.body.transactions.filter(
      (t) => t.reason === 'refund' && t.type === 'credit' && t.meta?.bookingId === bookingId
    );
    expect(refunds.length).toBeGreaterThanOrEqual(1);
  });

  it('does not credit wallet when cancelling an online booking', async () => {
    const token = await customerToken(app);
    const user = await User.findOne({ email: 'fin10@test.com' });
    const book = await request(app)
      .post('/api/me/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        arenaId: arena._id.toString(),
        courtId: court._id.toString(),
        date: '2026-12-02',
        timeSlot: '07:00 PM - 08:00 PM',
        amount: 25,
        paymentMethod: 'online',
      });
    expect(book.status).toBe(201);
    const bookingId = book.body.booking.id;

    const w0 = await Wallet.findOne({ userId: user._id });
    const bal0 = w0 ? w0.balance : 0;

    const cancel = await request(app)
      .patch(`/api/me/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(cancel.status).toBe(200);

    const w1 = await Wallet.findOne({ userId: user._id });
    const bal1 = w1 ? w1.balance : 0;
    expect(bal1).toBe(bal0);
  });
});
