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

  // The API runs behind a reverse proxy (same domain as the site). Without this, req.ip is the
  // proxy's address for everyone and the auth rate limiter locks out all users at once.
  // TRUST_PROXY=false when the app is exposed directly; a number sets the hop count.
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy !== 'false') {
    app.set('trust proxy', trustProxy && /^\d+$/.test(trustProxy) ? Number(trustProxy) : 1);
  }

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

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Map common database errors to client errors instead of a generic 500.
    if (err.name === 'CastError') {
      return res.status(400).json({ error: `Invalid ${err.path || 'id'}` });
    }
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors || {})[0];
      return res.status(400).json({ error: first?.message || 'Invalid request data' });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This record conflicts with an existing one (already booked or already exists).' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON body' });
    }

    const status = err.status || err.statusCode || 500;
    // eslint-disable-next-line no-console
    if (status >= 500) console.error(err);
    // Don't leak internal error details (stack-ish messages, DB internals) on 500s.
    return res.status(status).json({
      error: status >= 500 ? 'Internal server error' : (err.message || 'Request failed'),
    });
  });

  return app;
}

module.exports = { createApp };
