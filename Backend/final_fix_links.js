const mongoose = require('mongoose');
require('dotenv').config();

async function linkRegs() {
  await mongoose.connect(process.env.MONGODB_URI);
  const EventRegistration = require('./src/models/EventRegistration');
  
  // Link all registrations for 'chirag' to his user ID
  const res = await EventRegistration.updateMany(
    { name: /chirag/i },
    { $set: { userId: new mongoose.Types.ObjectId('69e4e052cc1cc5799849116f') } }
  );
  console.log(`Updated ${res.modifiedCount} registrations for chirag`);

  await mongoose.disconnect();
}

linkRegs().catch(console.error);
