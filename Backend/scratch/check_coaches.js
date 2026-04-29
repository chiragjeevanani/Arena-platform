const mongoose = require('mongoose');
const User = require('../src/models/User');
const { loadEnv } = require('../src/config/env');
const { connectDB } = require('../src/config/db');

async function checkCoaches() {
  await loadEnv();
  await connectDB();
  
  const coaches = await User.find({ role: 'COACH' }).lean();
  console.log('Total Coaches found:', coaches.length);
  coaches.forEach(c => {
    console.log(`- ${c.name} (${c.email}) | Role: ${c.role} | Arena: ${c.assignedArenaId}`);
  });
  
  process.exit(0);
}

checkCoaches().catch(err => {
  console.error(err);
  process.exit(1);
});
