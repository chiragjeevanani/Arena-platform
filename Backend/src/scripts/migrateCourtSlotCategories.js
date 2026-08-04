/**
 * Database Migration Script: CourtSlot Categorization Refactoring
 *
 * Migrates existing CourtSlot documents:
 *   - 'Normal' → 'Public'
 *   - 'Peak' → 'Public'  (Peak is now an independent pricing rule engine calculation)
 *   - 'Customer' → 'Reserved'
 *   - null/undefined/other → 'Public'
 */

const mongoose = require('mongoose');
const CourtSlot = require('../models/CourtSlot');

async function migrateCourtSlotCategories() {
  console.log('[Migration] Starting CourtSlot categorization refactoring...');

  const normalRes = await CourtSlot.updateMany(
    { type: { $in: ['Normal', 'Peak', null, ''] } },
    { $set: { type: 'Public' } }
  );

  const customerRes = await CourtSlot.updateMany(
    { type: 'Customer' },
    { $set: { type: 'Reserved' } }
  );

  console.log(`[Migration] CourtSlots updated to Public: ${normalRes.modifiedCount || 0}`);
  console.log(`[Migration] CourtSlots updated to Reserved: ${customerRes.modifiedCount || 0}`);
  console.log('[Migration] CourtSlot categorization refactoring complete.');
}

// Allow running directly via `node migrateCourtSlotCategories.js`
if (require.main === module) {
  require('dotenv').config();
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/arena-crm';
  mongoose.connect(mongoUri)
    .then(async () => {
      await migrateCourtSlotCategories();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateCourtSlotCategories };
