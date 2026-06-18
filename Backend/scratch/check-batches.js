const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const CoachingBatch = require('../src/models/CoachingBatch');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const Arena = require('../src/models/Arena');
  
  const allBatches = await CoachingBatch.find({}).lean();
  console.log(`Found ${allBatches.length} batches total:`);
  console.log('Today:', new Date().toISOString().slice(0, 10));
  for (const b of allBatches) {
    const arena = await Arena.findById(b.arenaId).lean();
    console.log(`- ID: ${b._id}, Title: ${b.title}, arenaId: ${b.arenaId}, isPublished: ${b.isPublished}, coachId: ${b.coachId}`);
    console.log(`  startDate: ${b.startDate}, endDate: ${b.endDate}`);
    if (arena) {
      console.log(`  └ Arena Name: ${arena.name}, isPublished: ${arena.isPublished}`);
    } else {
      console.log(`  └ Arena NOT found in DB!`);
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
