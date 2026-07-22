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
const paymentRoutes = require('./routes/paymentRoutes');

function createApp() {
  const app = express();

  app.use(helmet());
  
  const corsOrigin = process.env.CORS_ORIGIN;
  const origin = corsOrigin && corsOrigin.includes(',') 
    ? corsOrigin.split(',').map(o => o.trim()) 
    : (corsOrigin || true);
    
  app.use(cors({ origin }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const apiRouter = express.Router();
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  apiRouter.use('/', healthRoutes);
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/public', publicArenaRoutes);
  apiRouter.use('/me', meRoutes);
  apiRouter.use('/payments', paymentRoutes);
  apiRouter.use('/webhooks', webhookRoutes);
  apiRouter.use('/coach', coachRoutes);
  apiRouter.use('/notifications', notificationRoutes);
  apiRouter.use('/admin', adminRoutes);
  apiRouter.use('/arena-admin', arenaAdminRoutes);

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
