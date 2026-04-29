const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const publicArenaRoutes = require('./routes/publicArenaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const arenaAdminRoutes = require('./routes/arenaAdminRoutes');
const meRoutes = require('./routes/meRoutes');
const coachRoutes = require('./routes/coachRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

function createApp() {
  const app = express();

  app.use(helmet());
  
  const corsOrigin = process.env.CORS_ORIGIN;
  const origin = corsOrigin && corsOrigin.includes(',') 
    ? corsOrigin.split(',').map(o => o.trim()) 
    : (corsOrigin || true);
    
  app.use(cors({ origin }));
  app.use(express.json());

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicArenaRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/coach', coachRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/arena-admin', arenaAdminRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  return app;
}

module.exports = { createApp };
