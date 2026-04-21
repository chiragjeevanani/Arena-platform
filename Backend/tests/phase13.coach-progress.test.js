const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const CoachingBatch = require('../src/models/CoachingBatch');
const BatchEnrollment = require('../src/models/BatchEnrollment');
const CoachStudentProgress = require('../src/models/CoachStudentProgress');
const CoachRemark = require('../src/models/CoachRemark');

describe('Phase 13 — Coach progress & remarks', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await CoachRemark.deleteMany({});
    await CoachStudentProgress.deleteMany({});
    await BatchEnrollment.deleteMany({});
    await CoachingBatch.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  async function seedCoachStudentBatch() {
    const passwordHash = await bcrypt.hash('password123', 10);
    const coach = await User.create({
      email: 'cpcoach@test.com',
      passwordHash,
      name: 'Coach P',
      role: 'COACH',
    });
    const cust = await User.create({
      email: 'cpstu@test.com',
      passwordHash,
      name: 'Student P',
      role: 'CUSTOMER',
    });
    const arena = await Arena.create({
      name: 'Arena P',
      location: 'L',
      pricePerHour: 10,
      isPublished: true,
    });
    const batch = await CoachingBatch.create({
      arenaId: arena._id,
      coachId: coach._id,
      title: 'Batch P',
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
    const login = await request(app).post('/api/auth/login').send({
      email: 'cpcoach@test.com',
      password: 'password123',
    });
    return { coach, cust, batch, token: login.body.token };
  }

  it('PUT and GET progress for enrolled student', async () => {
    const { cust, batch, token } = await seedCoachStudentBatch();

    const put = await request(app)
      .put(`/api/coach/batches/${batch._id}/progress`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: cust._id.toString(),
        metrics: [
          {
            metricKey: 'footwork',
            groupCategory: 'Technical',
            name: 'Footwork',
            score: 8,
          },
        ],
        remarks: 'Solid base',
      });
    expect(put.status).toBe(200);
    expect(put.body.record.metrics).toHaveLength(1);
    expect(put.body.record.metrics[0].score).toBe(8);

    const list = await request(app)
      .get(`/api/coach/batches/${batch._id}/progress`)
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.records).toHaveLength(1);

    const one = await request(app)
      .get(`/api/coach/batches/${batch._id}/progress?userId=${cust._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(one.status).toBe(200);
    expect(one.body.records[0].studentName).toBe('Student P');
  });

  it('GET /students/:userId/batches lists enrolled batches', async () => {
    const { cust, batch, token } = await seedCoachStudentBatch();

    const res = await request(app)
      .get(`/api/coach/students/${cust._id}/batches`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.batches).toHaveLength(1);
    expect(res.body.batches[0].id).toBe(String(batch._id));
  });

  it('POST /remarks and DELETE', async () => {
    const { cust, batch, token } = await seedCoachStudentBatch();

    const post = await request(app)
      .post('/api/coach/remarks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        batchId: batch._id.toString(),
        studentUserId: cust._id.toString(),
        text: 'Great session',
        rating: 4,
      });
    expect(post.status).toBe(201);
    const rid = post.body.remark.id;

    const list = await request(app)
      .get(`/api/coach/remarks?batchId=${batch._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.remarks).toHaveLength(1);

    const del = await request(app)
      .delete(`/api/coach/remarks/${rid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });
});
