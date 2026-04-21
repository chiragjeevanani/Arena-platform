const request = require('supertest');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Payment = require('../src/models/Payment');
const Wallet = require('../src/models/Wallet');
const WalletTransaction = require('../src/models/WalletTransaction');

async function customerToken(app) {
  await request(app).post('/api/auth/register').send({
    email: 'pay9@test.com',
    password: 'password123',
    name: 'Payer',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'pay9@test.com',
    password: 'password123',
  });
  return login.body.token;
}

describe('Phase 9 — Mock payment intents and webhook', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await WalletTransaction.deleteMany({});
    await Payment.deleteMany({});
    await Wallet.deleteMany({});
    await User.deleteMany({});
  });

  it('returns 401 without token for payment intent', async () => {
    const res = await request(app).post('/api/me/payments/intent').send({ purpose: 'top_up', amount: 10 });
    expect(res.status).toBe(401);
  });

  it('creates pending payment intent for top_up', async () => {
    const token = await customerToken(app);
    const res = await request(app)
      .post('/api/me/payments/intent')
      .set('Authorization', `Bearer ${token}`)
      .send({ purpose: 'top_up', amount: 42 });
    expect(res.status).toBe(201);
    expect(res.body.payment.status).toBe('pending');
    expect(res.body.payment.amount).toBe(42);
    expect(res.body.clientSecret).toBeTruthy();
    const inDb = await Payment.findById(res.body.payment.id);
    expect(inDb.status).toBe('pending');
  });

  it('webhook confirms top_up and credits wallet (idempotent)', async () => {
    const token = await customerToken(app);
    const intent = await request(app)
      .post('/api/me/payments/intent')
      .set('Authorization', `Bearer ${token}`)
      .send({ purpose: 'top_up', amount: 100 });
    const paymentId = intent.body.payment.id;
    const secret = process.env.MOCK_PAYMENT_WEBHOOK_SECRET;

    const first = await request(app)
      .post('/api/webhooks/payments/mock')
      .set('x-mock-payment-secret', secret)
      .send({ paymentId });
    expect(first.status).toBe(200);
    expect(first.body.payment.status).toBe('succeeded');

    const w = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
    expect(w.body.wallet.balance).toBe(100);

    const second = await request(app)
      .post('/api/webhooks/payments/mock')
      .set('x-mock-payment-secret', secret)
      .send({ paymentId });
    expect(second.status).toBe(200);
    expect(second.body.alreadyProcessed).toBe(true);

    const w2 = await request(app).get('/api/me/wallet').set('Authorization', `Bearer ${token}`);
    expect(w2.body.wallet.balance).toBe(100);
  });

  it('rejects webhook without valid secret', async () => {
    const token = await customerToken(app);
    const intent = await request(app)
      .post('/api/me/payments/intent')
      .set('Authorization', `Bearer ${token}`)
      .send({ purpose: 'top_up', amount: 5 });
    const res = await request(app)
      .post('/api/webhooks/payments/mock')
      .set('x-mock-payment-secret', 'wrong')
      .send({ paymentId: intent.body.payment.id });
    expect(res.status).toBe(401);
  });
});
