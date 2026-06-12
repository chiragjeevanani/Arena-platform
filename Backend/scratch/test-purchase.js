require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { getMySlotMemberships } = require('../src/controllers/meSlotMembershipController');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arena-crm');
    console.log('Connected to DB');

    const user = await User.findOne().lean();
    if (!user) { return console.log('No User'); }
    console.log('Using User:', user._id);

    // Mock request and response
    const req = {
      auth: { sub: String(user._id) },
      query: {}
    };

    const res = {
      status: function(code) {
        console.log('STATUS:', code);
        return this;
      },
      json: function(data) {
        console.log('JSON success, count:', data.memberships?.length);
        return this;
      }
    };

    await getMySlotMemberships(req, res);
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
