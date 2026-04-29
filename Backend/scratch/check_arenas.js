const mongoose = require('mongoose');
const Arena = require('../src/models/Arena');
const { loadEnv } = require('../src/config/env');
const { connectDB } = require('../src/config/db');

async function checkArenas() {
  await loadEnv();
  await connectDB();
  
  const arenas = await Arena.find({}).lean();
  console.log('Total Arenas found:', arenas.length);
  arenas.forEach(a => {
    console.log(`- ${a.name} | ID: ${a._id}`);
  });
  
  process.exit(0);
}

checkArenas().catch(err => {
  console.error(err);
  process.exit(1);
});
