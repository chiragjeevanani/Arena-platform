/**
 * Migration: Backfill Pricing Snapshot Fields on Existing Bookings
 *
 * Sets normalPrice, basePrice, peakSurcharge, finalPrice, pricingType, pricingRuleId,
 * pricingRuleName, priceCalculatedAt for all bookings where snapshot fields are missing.
 *
 * Safe to run multiple times (idempotent).
 */
const path = require('path');
const backendDir = 'd:/Appzeto_Projects/Arena-platform/Backend';
const mongoose = require(path.join(backendDir, 'node_modules/mongoose'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
dotenv.config({ path: path.join(backendDir, '.env') });

const Arena = require(path.join(backendDir, 'src/models/Arena'));
const Court = require(path.join(backendDir, 'src/models/Court'));
const CourtSlot = require(path.join(backendDir, 'src/models/CourtSlot'));
const Booking = require(path.join(backendDir, 'src/models/Booking'));
const { evaluatePricing } = require(path.join(backendDir, 'src/services/pricingEngine'));

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);

  // Find all bookings with missing snapshot fields
  const bookings = await Booking.find({
    $or: [
      { normalPrice: { $exists: false } },
      { normalPrice: 0, basePrice: 0, finalPrice: 0 },
    ],
    type: { $in: ['court', null, undefined, ''] },
  }).lean();

  console.log(`Found ${bookings.length} bookings needing snapshot backfill`);
  if (bookings.length === 0) { await mongoose.disconnect(); return; }

  // Cache arenas and courts to reduce DB queries
  const arenaCache = {};
  const courtCache = {};

  let updated = 0;
  let failed = 0;

  for (const b of bookings) {
    try {
      const arenaId = String(b.arenaId);
      const courtId = String(b.courtId);

      if (!arenaCache[arenaId]) {
        arenaCache[arenaId] = await Arena.findById(arenaId).lean();
      }
      if (!courtCache[courtId]) {
        courtCache[courtId] = await Court.findById(courtId).lean();
      }

      const arena = arenaCache[arenaId];
      const court = courtCache[courtId];
      if (!arena || !court) { failed++; continue; }

      // Find the CourtSlot for this booking's timeSlot
      const courtSlot = await CourtSlot.findOne({
        courtId,
        arenaId,
        timeSlot: b.timeSlot,
      }).lean();

      const engineRes = evaluatePricing({
        arena,
        court,
        date: b.date,
        timeSlot: b.timeSlot,
        slot: courtSlot,
      });

      await Booking.updateOne(
        { _id: b._id },
        {
          $set: {
            normalPrice: engineRes.pricing.basePrice,
            basePrice: engineRes.pricing.basePrice,
            peakPrice: engineRes.pricing.type === 'peak' ? engineRes.pricing.finalPrice : 0,
            peakSurcharge: engineRes.pricing.peakSurcharge,
            finalPrice: engineRes.pricing.finalPrice,
            pricingType: engineRes.pricing.type,
            pricingRuleId: engineRes.pricing.ruleId,
            pricingRuleName: engineRes.pricing.ruleName,
            priceCalculatedAt: new Date(),
          }
        }
      );

      console.log(`✅ ${b._id} | ${b.date} ${b.timeSlot} | type=${engineRes.pricing.type} | base=${engineRes.pricing.basePrice} | surcharge=${engineRes.pricing.peakSurcharge} | final=${engineRes.pricing.finalPrice}`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed ${b._id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nMigration complete: ${updated} updated, ${failed} failed`);
  await mongoose.disconnect();
}

main().catch(err => { console.error('MIGRATION ERROR:', err.message); process.exit(1); });
