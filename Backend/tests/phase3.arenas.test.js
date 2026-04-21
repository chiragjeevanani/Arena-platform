jest.mock('cloudinary', () => {
  const upload_stream = jest.fn((opts, cb) => {
    const mockStream = {
      end: () => {
        process.nextTick(() =>
          cb(null, {
            secure_url: 'https://res.cloudinary.com/demo/sample.png',
            public_id: 'arena-crm/test-id',
          })
        );
      },
    };
    return mockStream;
  });
  return {
    v2: {
      config: jest.fn(),
      uploader: { upload_stream },
    },
  };
});

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Arena = require('../src/models/Arena');
const Court = require('../src/models/Court');

async function createSuperAdminToken(app) {
  const passwordHash = await bcrypt.hash('adminpass123', 10);
  await User.create({
    email: 'super@test.com',
    passwordHash,
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'super@test.com',
    password: 'adminpass123',
  });
  return login.body.token;
}

async function createCustomerToken(app) {
  await request(app).post('/api/auth/register').send({
    email: 'cust@test.com',
    password: 'password123',
    name: 'Customer',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'cust@test.com',
    password: 'password123',
  });
  return login.body.token;
}

describe('Phase 3 — Arenas, courts, Cloudinary upload', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterEach(async () => {
    await Court.deleteMany({});
    await Arena.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/public/arenas', () => {
    it('returns empty list when no published arenas', async () => {
      const res = await request(app).get('/api/public/arenas');
      expect(res.status).toBe(200);
      expect(res.body.arenas).toEqual([]);
    });

    it('returns published arenas with courtsCount', async () => {
      const arena = await Arena.create({
        name: 'Elite Arena',
        location: 'Muscat',
        pricePerHour: 4.5,
        category: 'Badminton',
        isPublished: true,
        imageUrl: '',
      });
      await Court.create({ arenaId: arena._id, name: 'Court 1', type: 'Wooden' });
      await Court.create({ arenaId: arena._id, name: 'Court 2', type: 'Synthetic' });

      const res = await request(app).get('/api/public/arenas');
      expect(res.status).toBe(200);
      expect(res.body.arenas).toHaveLength(1);
      expect(res.body.arenas[0]).toMatchObject({
        id: arena._id.toString(),
        name: 'Elite Arena',
        location: 'Muscat',
        pricePerHour: 4.5,
        courtsCount: 2,
        category: 'Badminton',
      });
    });

    it('hides unpublished arenas from public list', async () => {
      await Arena.create({
        name: 'Draft',
        location: 'X',
        pricePerHour: 1,
        isPublished: false,
      });
      const res = await request(app).get('/api/public/arenas');
      expect(res.body.arenas).toHaveLength(0);
    });
  });

  describe('GET /api/public/arenas/:id', () => {
    it('returns 404 for unknown id', async () => {
      const res = await request(app).get(
        '/api/public/arenas/507f1f77bcf86cd799439011'
      );
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid id format', async () => {
      const res = await request(app).get('/api/public/arenas/not-an-id');
      expect(res.status).toBe(400);
    });

    it('returns arena with courts when published', async () => {
      const arena = await Arena.create({
        name: 'Show Arena',
        location: 'Seeb',
        pricePerHour: 5,
        amenities: ['Parking'],
        description: 'Nice',
        isPublished: true,
      });
      await Court.create({ arenaId: arena._id, name: 'A', type: 'Wooden' });

      const res = await request(app).get(`/api/public/arenas/${arena._id}`);
      expect(res.status).toBe(200);
      expect(res.body.arena).toMatchObject({
        id: arena._id.toString(),
        name: 'Show Arena',
        courtsCount: 1,
      });
      expect(res.body.arena.courts).toHaveLength(1);
      expect(res.body.arena.courts[0]).toMatchObject({ name: 'A', type: 'Wooden' });
    });
  });

  describe('POST /api/admin/arenas', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/admin/arenas').send({ name: 'X' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for non–super-admin', async () => {
      const token = await createCustomerToken(app);
      const res = await request(app)
        .post('/api/admin/arenas')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X', pricePerHour: 1 });
      expect(res.status).toBe(403);
    });

    it('returns 201 and arena for SUPER_ADMIN', async () => {
      const token = await createSuperAdminToken(app);
      const res = await request(app)
        .post('/api/admin/arenas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Arena',
          location: 'Bawshar',
          pricePerHour: 4,
          category: 'Badminton',
          description: 'Pro courts',
          amenities: ['Cafe'],
          imageUrl: 'https://example.com/img.jpg',
          isPublished: true,
        });
      expect(res.status).toBe(201);
      expect(res.body.arena.name).toBe('New Arena');
      expect(res.body.arena.id).toBeTruthy();
    });

    it('returns 400 when name missing', async () => {
      const token = await createSuperAdminToken(app);
      const res = await request(app)
        .post('/api/admin/arenas')
        .set('Authorization', `Bearer ${token}`)
        .send({ pricePerHour: 1 });
      expect(res.status).toBe(400);
    });
  });

  describe('Courts admin', () => {
    it('POST /api/admin/arenas/:arenaId/courts creates court', async () => {
      const token = await createSuperAdminToken(app);
      const arena = await Arena.create({
        name: 'A',
        location: 'L',
        pricePerHour: 3,
        isPublished: true,
      });
      const res = await request(app)
        .post(`/api/admin/arenas/${arena._id}/courts`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Court 9', type: 'Synthetic' });
      expect(res.status).toBe(201);
      expect(res.body.court.name).toBe('Court 9');
      expect(res.body.court.arenaId).toBe(arena._id.toString());
    });

    it('DELETE /api/admin/courts/:courtId removes court', async () => {
      const token = await createSuperAdminToken(app);
      const arena = await Arena.create({
        name: 'A',
        location: 'L',
        pricePerHour: 3,
        isPublished: true,
      });
      const court = await Court.create({
        arenaId: arena._id,
        name: 'Temp',
        type: 'Wooden',
      });
      const res = await request(app)
        .delete(`/api/admin/courts/${court._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(await Court.findById(court._id)).toBeNull();
    });
  });

  describe('POST /api/admin/upload/image', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/upload/image')
        .attach('file', Buffer.from('x'), 'x.png');
      expect(res.status).toBe(401);
    });

    it('returns 400 when no file', async () => {
      const token = await createSuperAdminToken(app);
      const res = await request(app)
        .post('/api/admin/upload/image')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('returns url for SUPER_ADMIN with file', async () => {
      const token = await createSuperAdminToken(app);
      const res = await request(app)
        .post('/api/admin/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-png-bytes'), 'court.png');
      expect(res.status).toBe(200);
      expect(res.body.url).toMatch(/^https:\/\//);
      expect(res.body.publicId).toBeTruthy();
    });
  });
});
