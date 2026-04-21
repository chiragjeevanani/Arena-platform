const mongoose = require('mongoose');
require('dotenv').config();

async function checkAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Booking = require('./src/models/Booking');
  const EventRegistration = require('./src/models/EventRegistration');
  
  const bookings = await Booking.find({}).sort({ createdAt: -1 });
  console.log(`Total Bookings found: ${bookings.length}`);
  bookings.forEach((b, i) => {
    console.log(`[B${i}] ID: ${b._id}, Date: ${b.date}, Slot: ${b.timeSlot}, Price: ${b.amount}`);
  });

  const regs = await EventRegistration.find({}).sort({ createdAt: -1 });
  console.log(`Total Registrations found: ${regs.length}`);
  regs.forEach((r, i) => {
    console.log(`[R${i}] ID: ${r._id}, Name: ${r.name}, Phone: ${r.phone}, EventId: ${r.eventId}`);
  });

  await mongoose.disconnect();
}

checkAll().catch(console.error);
