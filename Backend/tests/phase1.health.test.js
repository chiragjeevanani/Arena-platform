const request = require('supertest');
const { createApp } = require('../src/app');

describe('Phase 1 — GET /api/health', () => {
  it('returns 200 and service payload', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      service: 'arena-crm-api',
    });
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });
});
