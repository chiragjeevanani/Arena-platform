const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/arena');
  const b = await Booking.findOne().populate('userId', 'name phone').lean();
  console.log('Sample Booking:', JSON.stringify(b, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
