/**
 * Database Migration Script: remove 'pending' from the booking slot-hold index
 *
 * The unique index on { courtId, date, timeSlot } used to include status
 * 'pending', so an unpaid checkout blocked the slot for everyone else. It now
 * only covers 'confirmed'/'rescheduled' — a slot is taken only once payment
 * has actually succeeded. This script drops the old index so Mongoose can
 * rebuild it with the new definition on next app start (or does so directly).
 *
 * Safe to run multiple times.
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking');

async function migrateBookingSlotHoldIndex() {
  console.log('[Migration] Checking booking slot-hold index...');

  const indexes = await Booking.collection.indexes();
  const old = indexes.find(
    (idx) =>
      idx.key &&
      idx.key.courtId === 1 &&
      idx.key.date === 1 &&
      idx.key.timeSlot === 1
  );

  if (old) {
    console.log(`[Migration] Dropping existing index "${old.name}"...`);
    await Booking.collection.dropIndex(old.name);
  } else {
    console.log('[Migration] No existing courtId+date+timeSlot index found.');
  }

  console.log('[Migration] Rebuilding index from current schema...');
  await Booking.syncIndexes();
  console.log('[Migration] Done.');
}

if (require.main === module) {
  require('dotenv').config();
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/arena-crm';
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await migrateBookingSlotHoldIndex();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateBookingSlotHoldIndex };
