const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  const regs = await db.collection('eventregistrations').find({}).toArray();
  console.log('--- REGISTRATIONS ---');
  regs.forEach(r => {
    console.log(`ID: ${r._id}, eventId: ${r.eventId}, type: ${typeof r.eventId}`);
  });
  
  const events = await db.collection('cmscontents').find({}).toArray();
  console.log('--- EVENTS ---');
  events.forEach(e => {
    console.log(`ID: ${e._id}, title: ${e.title}, type: ${typeof e._id}`);
  });
  
  await mongoose.disconnect();
}

check();
