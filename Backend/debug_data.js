const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const EventRegistration = require('./src/models/EventRegistration');
const CmsContent = require('./src/models/CmsContent');

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    console.log('\n--- EVENTS ---');
    const events = await CmsContent.find({ kind: 'event' });
    events.forEach(e => {
      console.log(`- [${e._id}] ${e.title}`);
    });

    console.log('\n--- REGISTRATIONS ---');
    const regs = await EventRegistration.find({});
    regs.forEach(r => {
      console.log(`- [Reg ${r._id}] EventID: ${r.eventId}, Name: ${r.name}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugData();
