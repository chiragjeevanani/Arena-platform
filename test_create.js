const mongoose = require('mongoose');
const Arena = require('./Backend/src/models/Arena');
const Court = require('./Backend/src/models/Court');

async function testCreate() {
  const uri = 'mongodb+srv://chiragjeevanani333_db_user:chiragcj@cluster0.l8dydzs.mongodb.net/arenacrmtest?appName=Cluster0';
  await mongoose.connect(uri);
  
  const arenaId = '69e708192da289ec94cd11f2'; // AMM
  console.log('Creating court for arena:', arenaId);
  
  const court = await Court.create({
    arenaId: arenaId,
    name: 'Manual Test Court 1',
    type: 'Wooden',
    status: 'active'
  });
  
  console.log('Court created:', court);
  
  const allCourts = await Court.find();
  console.log('Total Courts now:', allCourts.length);
  
  await mongoose.disconnect();
}

testCreate().catch(console.error);
