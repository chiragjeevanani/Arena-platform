const mongoose = require('mongoose');
const Arena = require('./Backend/src/models/Arena');
const Court = require('./Backend/src/models/Court');

async function syncRegistry() {
  const uri = 'mongodb+srv://chiragjeevanani333_db_user:chiragcj@cluster0.l8dydzs.mongodb.net/arenacrmtest?appName=Cluster0';
  await mongoose.connect(uri);
  
  const arenaId = '69e708192da289ec94cd11f2'; // AMM
  console.log('Synchronizing Registry for:', arenaId);
  
  const courts = await Court.find({ arenaId }).sort({ createdAt: 1 });
  
  for (let i = 0; i < courts.length; i++) {
    const newName = `Court ${i + 1}`;
    await Court.findByIdAndUpdate(courts[i]._id, { name: newName });
    console.log(`Renamed ${courts[i].name} -> ${newName}`);
  }
  
  console.log('Registry Synchronized.');
  await mongoose.disconnect();
}

syncRegistry().catch(console.error);
