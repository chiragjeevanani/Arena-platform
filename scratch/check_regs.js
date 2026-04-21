const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../Backend/.env') });

const EventRegistration = require('../Backend/src/models/EventRegistration');

async function checkRegistrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const regs = await EventRegistration.find({}).populate('eventId');
    console.log('Total Registrations:', regs.length);
    regs.forEach(r => {
      console.log(`- ID: ${r._id}, Name: ${r.name}, Phone: ${r.phone}, Event: ${r.eventId?.title || r.eventId}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkRegistrations();
