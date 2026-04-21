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
const CoachingBatch = require('../src/models/CoachingBatch');
const BatchEnrollment = require('../src/models/BatchEnrollment');
const InventoryItem = require('../src/models/InventoryItem');
const PosSale = require('../src/models/PosSale');
const CmsContent = require('../src/models/CmsContent');

async function superToken(app) {
  const passwordHash = await bcrypt.hash('super6pass', 10);
  await User.create({
    email: 'super6@test.com',
    passwordHash,
    name: 'Super6',
    role: 'SUPER_ADMIN',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'super6@test.com',
    password: 'super6pass',
  });
  return login.body.token;
}

async function coachToken(app) {
  const passwordHash = await bcrypt.hash('coach6pass', 10);
  await User.create({
    email: 'coach6@test.com',
    passwordHash,
    name: 'Coach6',
    role: 'COACH',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'coach6@test.com',
    password: 'coach6pass',
  });
  return login.body.token;
}

async function customerToken(app) {
  await request(app).post('/api/auth/register').send({
    email: 'cust6@test.com',
    password: 'password123',
    name: 'Cust6',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'cust6@test.com',
    password: 'password123',
  });
  return login.body.token;
}

describe('Phase 6 — Coaching, inventory, POS, CMS', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await PosSale.deleteMany({});
    await BatchEnrollment.deleteMany({});
    await CoachingBatch.deleteMany({});
    await InventoryItem.deleteMany({});
    await CmsContent.deleteMany({});
    await WalletTransaction.deleteMany({});
    await UserMembership.deleteMany({});
    await MembershipPlan.deleteMany({});
    await Wallet.deleteMany({});
    await Booking.deleteMany({});
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  it('admin manages coaching batches; coach lists assigned batches; public lists published', async () => {
    const arena = await Arena.create({
      name: 'Coach Arena',
      location: 'X',
      pricePerHour: 10,
      isPublished: true,
    });
    const coachTok = await coachToken(app);
    const coach = await User.findOne({ email: 'coach6@test.com' });
    const adminTok = await superToken(app);

    const created = await request(app)
      .post('/api/admin/coaching-batches')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        arenaId: arena._id.toString(),
        coachId: coach._id.toString(),
        title: 'Beginners',
        capacity: 10,
        startDate: '2026-09-01',
        endDate: '2026-10-01',
        price: 0,
        isPublished: false,
      });
    expect(created.status).toBe(201);

    const pub = await request(app).get(`/api/public/arenas/${arena._id}/coaching-batches`);
    expect(pub.status).toBe(200);
    expect(pub.body.batches).toHaveLength(0);

    const batchId = created.body.batch.id;
    await request(app)
      .patch(`/api/admin/coaching-batches/${batchId}`)
      .set('Authorization', `Bearer ${adminTok}`)
      .send({ isPublished: true });

    const pub2 = await request(app).get(`/api/public/arenas/${arena._id}/coaching-batches`);
    expect(pub2.body.batches).toHaveLength(1);
    expect(pub2.body.batches[0].spotsRemaining).toBe(10);

    const coachList = await request(app).get('/api/coach/batches').set('Authorization', `Bearer ${coachTok}`);
    expect(coachList.status).toBe(200);
    expect(coachList.body.batches).toHaveLength(1);
    expect(coachList.body.batches[0].arenaName).toBe('Coach Arena');
  });

  it('returns 400 when coachId is not a COACH user', async () => {
    const arena = await Arena.create({
      name: 'A',
      location: 'Y',
      pricePerHour: 1,
      isPublished: true,
    });
    await customerToken(app);
    const cust = await User.findOne({ email: 'cust6@test.com' });
    const adminTok = await superToken(app);

    const res = await request(app)
      .post('/api/admin/coaching-batches')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        arenaId: arena._id.toString(),
        coachId: cust._id.toString(),
        title: 'Bad',
        capacity: 5,
        startDate: '2026-09-01',
        endDate: '2026-10-01',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/coach/i);
  });

  it('customer enrolls, cannot double-enroll, respects capacity', async () => {
    const arena = await Arena.create({
      name: 'Enroll Arena',
      location: 'Z',
      pricePerHour: 1,
      isPublished: true,
    });
    const coachTok = await coachToken(app);
    const coach = await User.findOne({ email: 'coach6@test.com' });
    const adminTok = await superToken(app);

    const batchRes = await request(app)
      .post('/api/admin/coaching-batches')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        arenaId: arena._id.toString(),
        coachId: coach._id.toString(),
        title: 'Tiny',
        capacity: 1,
        startDate: '2026-09-01',
        endDate: '2026-10-01',
        isPublished: true,
      });
    const batchId = batchRes.body.batch.id;

    const custTok = await customerToken(app);
    const first = await request(app)
      .post('/api/me/enrollments')
      .set('Authorization', `Bearer ${custTok}`)
      .send({ batchId });
    expect(first.status).toBe(201);

    const dup = await request(app)
      .post('/api/me/enrollments')
      .set('Authorization', `Bearer ${custTok}`)
      .send({ batchId });
    expect(dup.status).toBe(409);

    await request(app).post('/api/auth/register').send({
      email: 'cust6b@test.com',
      password: 'password123',
      name: 'B',
    });
    const loginB = await request(app).post('/api/auth/login').send({
      email: 'cust6b@test.com',
      password: 'password123',
    });
    const full = await request(app)
      .post('/api/me/enrollments')
      .set('Authorization', `Bearer ${loginB.body.token}`)
      .send({ batchId });
    expect(full.status).toBe(400);
    expect(full.body.error).toMatch(/full/i);
  });

  it('inventory and POS sale adjust stock', async () => {
    const arena = await Arena.create({
      name: 'Shop Arena',
      location: 'S',
      pricePerHour: 1,
      isPublished: true,
    });
    const adminTok = await superToken(app);

    const itemRes = await request(app)
      .post('/api/admin/inventory')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        arenaId: arena._id.toString(),
        name: 'Shuttle',
        quantity: 5,
        unitPrice: 2,
      });
    expect(itemRes.status).toBe(201);
    const itemId = itemRes.body.item.id;

    const sale = await request(app)
      .post('/api/admin/pos/sales')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        arenaId: arena._id.toString(),
        lines: [{ inventoryItemId: itemId, qty: 2 }],
      });
    expect(sale.status).toBe(201);
    expect(sale.body.sale.totalAmount).toBe(4);

    const items = await request(app)
      .get(`/api/admin/inventory?arenaId=${arena._id}`)
      .set('Authorization', `Bearer ${adminTok}`);
    const shuttle = items.body.items.find((i) => i.id === itemId);
    expect(shuttle.quantity).toBe(3);

    const bad = await request(app)
      .post('/api/admin/pos/sales')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        arenaId: arena._id.toString(),
        lines: [{ inventoryItemId: itemId, qty: 10 }],
      });
    expect(bad.status).toBe(400);
  });

  it('CMS: admin creates content; public lists published by kind', async () => {
    const adminTok = await superToken(app);

    const draft = await request(app)
      .post('/api/admin/cms')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({ kind: 'hero', title: 'Draft hero', isPublished: false });
    expect(draft.status).toBe(201);

    await request(app)
      .post('/api/admin/cms')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        kind: 'hero',
        title: 'Live hero',
        subtitle: 'Welcome',
        isPublished: true,
        sortOrder: 1,
      });

    const pub = await request(app).get('/api/public/cms?kind=hero');
    expect(pub.status).toBe(200);
    expect(pub.body.contents.map((c) => c.title)).toContain('Live hero');
    expect(pub.body.contents.map((c) => c.title)).not.toContain('Draft hero');

    const del = await request(app)
      .delete(`/api/admin/cms/${draft.body.content.id}`)
      .set('Authorization', `Bearer ${adminTok}`);
    expect(del.status).toBe(204);
  });

  it('CMS: public fetches published content by id', async () => {
    const adminTok = await superToken(app);
    const created = await request(app)
      .post('/api/admin/cms')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        kind: 'event',
        title: 'Public by id event',
        subtitle: 'Sub',
        body: 'Body',
        isPublished: true,
      });
    expect(created.status).toBe(201);
    const id = created.body.content.id;

    const ok = await request(app).get(`/api/public/cms/${id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.content.title).toBe('Public by id event');

    const draft = await request(app)
      .post('/api/admin/cms')
      .set('Authorization', `Bearer ${adminTok}`)
      .send({ kind: 'event', title: 'Draft only', isPublished: false });
    expect(draft.status).toBe(201);
    const miss = await request(app).get(`/api/public/cms/${draft.body.content.id}`);
    expect(miss.status).toBe(404);
  });
});
