const mongoose = require('mongoose');
require('dotenv').config();

async function checkDetailed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const EventRegistration = require('./src/models/EventRegistration');
  const regs = await EventRegistration.find({}).sort({ createdAt: -1 });
  console.log(`Total Registrations: ${regs.length}`);
  regs.forEach(r => {
    console.log(`ID: ${r._id}, Name: ${r.name}, Phone: ${r.phone}, UserId: ${r.userId}, EventId: ${r.eventId}`);
  });
  await mongoose.disconnect();
}

checkDetailed().catch(console.error);
