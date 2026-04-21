const mongoose = require('mongoose');
require('dotenv').config();

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const EventRegistration = require('./src/models/EventRegistration');
  
  const regs = await EventRegistration.find({}).sort({ createdAt: -1 });
  console.log(`Total registrations found: ${regs.length}`);
  
  regs.forEach((r, i) => {
    console.log(`[${i}] ID: ${r._id}, Name: ${r.name}, Phone: ${r.phone}, EventId: ${r.eventId}, UserId: ${r.userId}, Created: ${r.createdAt}`);
  });

  await mongoose.disconnect();
}

checkDuplicates().catch(console.error);
