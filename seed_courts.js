const mongoose = require('mongoose');
const Arena = require('./Backend/src/models/Arena');
const Court = require('./Backend/src/models/Court');

async function seedCourts() {
  const uri = 'mongodb+srv://chiragjeevanani333_db_user:chiragcj@cluster0.l8dydzs.mongodb.net/arenacrmtest?appName=Cluster0';
  await mongoose.connect(uri);
  
  const arenaId = '69e708192da289ec94cd11f2'; // AMM
  console.log('Seeding courts for arena:', arenaId);
  
  // Clear existing if any
  await Court.deleteMany({ arenaId: arenaId });
  
  const courts = [
    { name: 'Court A (Prime)', type: 'Wooden', status: 'active' },
    { name: 'Court B', type: 'Wooden', status: 'active' },
    { name: 'Court C', type: 'Turf', status: 'active' },
    { name: 'Court D', type: 'Wooden', status: 'inactive' },
    { name: 'Court E', type: 'Acrylic', status: 'active' },
  ];
  
  for (const c of courts) {
    await Court.create({ ...c, arenaId });
  }
  
  console.log('5 Courts seeded successfully.');
  
  const count = await Court.countDocuments({ arenaId });
  await Arena.findByIdAndUpdate(arenaId, { courtsCount: count });
  
  await mongoose.disconnect();
}

seedCourts().catch(console.error);
