const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');
require('dotenv').config({ path: '../.env' });

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }
  console.log('Connecting to:', uri.split('@')[1]); // Hide credentials
  await mongoose.connect(uri);
  const b = await Booking.findOne().populate('userId', 'name phone').lean();
  console.log('Sample Booking:', JSON.stringify(b, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
