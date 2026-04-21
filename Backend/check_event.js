const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  
  const ev = await db.collection('cmscontents').findOne({ _id: new mongoose.Types.ObjectId('69e5d2af53873f2e1cfe946f') });
  console.log('--- EVENT DATA ---');
  console.log(JSON.stringify(ev, null, 2));
  
  await mongoose.disconnect();
}

check();
