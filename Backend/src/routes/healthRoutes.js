const express = require('express');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/asyncHandler');
const { getBankMuscatConfig } = require('../providers/bankMuscat/bankMuscatConfig');

const router = express.Router();

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    let db = 'down';
    try {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.command({ ping: 1 });
        db = 'up';
      }
    } catch {
      db = 'down';
    }

    const ok = db === 'up';
    const payload = {
      ok,
      service: 'arena-crm-api',
      uptime: process.uptime(),
      db,
    };

    if (ok) {
      return res.json(payload);
    }
    return res.status(503).json(payload);
  })
);

/** Public — no secrets. Use to verify live Bank Muscat env after deploy. */
router.get(
  '/health/bank-muscat',
  asyncHandler(async (_req, res) => {
    const cfg = getBankMuscatConfig();
    const hostOf = (u) => {
      try {
        return new URL(u).host;
      } catch {
        return null;
      }
    };
    return res.json({
      configured: cfg.configured,
      env: cfg.env,
      crypto: cfg.crypto,
      mid: cfg.merchantId || null,
      accessCodeLength: (cfg.accessCode || '').length,
      workingKeyLength: (cfg.workingKey || '').length,
      gatewayHost: hostOf(cfg.gatewayUrl),
      callbackHost: hostOf(cfg.callbackUrl),
      returnHost: hostOf(cfg.returnUrl),
      statusApiHost: hostOf(cfg.statusApiUrl),
      inquiryApiImplemented: Boolean(cfg.statusApiUrl),
    });
  })
);

module.exports = router;
