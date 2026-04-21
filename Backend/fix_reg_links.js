const mongoose = require('mongoose');
require('dotenv').config();

async function fixData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./src/models/User');
  const EventRegistration = require('./src/models/EventRegistration');

  const user = await User.findOne({ phone: '8989898989' });
  if (!user) {
    console.log('User not found');
    return;
  }
  console.log(`Found user: ${user._id} (${user.name})`);

  const res = await EventRegistration.updateMany(
    { phone: '8989898989', userId: { $exists: false } },
    { $set: { userId: user._id } }
  );
  console.log(`Updated ${res.modifiedCount} registrations`);

  await mongoose.disconnect();
}

fixData().catch(console.error);
