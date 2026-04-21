const mongoose = require('mongoose');
const CourtSlot = require('./src/models/CourtSlot');

async function checkSlots() {
  const uri = 'mongodb+srv://chiragjeevanani333_db_user:chiragcj@cluster0.l8dydzs.mongodb.net/arenacrmtest?appName=Cluster0';
  await mongoose.connect(uri);
  
  const slots = await CourtSlot.find({}).lean();
  console.log('Total slots found:', slots.length);
  slots.forEach(s => {
    console.log(`Slot: ${s.timeSlot} | ArenaID: ${s.arenaId} | CourtID: ${s.courtId} | Day: ${s.dayOfWeek}`);
  });
  
  await mongoose.disconnect();
}

checkSlots().catch(console.error);
