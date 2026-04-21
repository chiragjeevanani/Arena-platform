const express = require('express');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/asyncHandler');

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

module.exports = router;
