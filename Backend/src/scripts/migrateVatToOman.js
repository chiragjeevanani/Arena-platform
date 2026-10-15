/**
 * Database Migration Script: coaching batch tax 18% → Oman VAT (5%)
 *
 * Coaching batches used to default to an 18% tax (India's GST rate). Oman VAT is 5%.
 * This updates every batch still on exactly 18% to the current VAT rate
 * (VAT_PERCENT, default 5). Batches an admin set to any other rate are left alone.
 *
 * Run once on the server:  node src/scripts/migrateVatToOman.js
 * Add --dry-run to only list what would change. Safe to run multiple times.
 */

const mongoose = require('mongoose');
const CoachingBatch = require('../models/CoachingBatch');
const { vatPercent } = require('../services/catalogPricing');

async function migrateVatToOman({ dryRun = false } = {}) {
  const target = vatPercent();
  const affected = await CoachingBatch.find({ taxPercent: 18 }).select('title taxPercent').lean();
  console.log(`[Migration] ${affected.length} coaching batch(es) on 18% tax → ${target}%`);
  for (const b of affected) console.log(`  - ${b.title} (${b._id})`);
  if (dryRun || !affected.length) return affected.length;

  const res = await CoachingBatch.updateMany({ taxPercent: 18 }, { $set: { taxPercent: target } });
  console.log(`[Migration] Updated ${res.modifiedCount} batch(es).`);
  return res.modifiedCount;
}

if (require.main === module) {
  require('dotenv').config();
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/arena-crm';
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await migrateVatToOman({ dryRun: process.argv.includes('--dry-run') });
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateVatToOman };
