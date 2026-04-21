const mongoose = require('mongoose');
const path = require('path');

// Dynamically require models from the Backend folder
const Arena = require('./Backend/src/models/Arena');
const Court = require('./Backend/src/models/Court');
const User = require('./Backend/src/models/User');

async function debugData() {
  const uri = 'mongodb+srv://chiragjeevanani333_db_user:chiragcj@cluster0.l8dydzs.mongodb.net/arenacrmtest?appName=Cluster0';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  
  const arenas = await Arena.find();
  console.log('\n--- ARENAS ---');
  console.log('Total:', arenas.length);
  arenas.forEach(a => console.log(`[${a._id}] Name: ${a.name} CourtsCount: ${a.courtsCount}`));
  
  const courts = await Court.find();
  console.log('\n--- COURTS ---');
  console.log('Total:', courts.length);
  courts.forEach(c => console.log(`[${c._id}] Name: ${c.name} ArenaID: ${c.arenaId}`));

  const users = await User.find({ role: 'ARENA_ADMIN' });
  console.log('\n--- ARENA ADMINS ---');
  users.forEach(u => console.log(`[${u._id}] Name: ${u.name} Email: ${u.email} AssignedArenaId: ${u.assignedArenaId}`));
  
  await mongoose.disconnect();
}

debugData().catch(err => {
    console.error(err);
    process.exit(1);
});
