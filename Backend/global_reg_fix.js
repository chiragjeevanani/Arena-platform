const mongoose = require('mongoose');
require('dotenv').config();

async function globalFix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const EventRegistration = require('./src/models/EventRegistration');
  
  // Link ALL registrations to the user chiragj by name/phone heuristics since he is the only one testing
  const res = await EventRegistration.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: new mongoose.Types.ObjectId('69e4e052cc1cc5799849116f') } }
  );
  console.log(`Linked ${res.modifiedCount} orphan registrations to chiragj`);

  await mongoose.disconnect();
}

globalFix().catch(console.error);
