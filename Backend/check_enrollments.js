const mongoose = require('mongoose');
require('dotenv').config();

async function checkEnrollments() {
  await mongoose.connect(process.env.MONGODB_URI);
  const BatchEnrollment = require('./src/models/BatchEnrollment');
  const items = await BatchEnrollment.find({});
  console.log(`Total Enrollments: ${items.length}`);
  items.forEach(i => console.log(JSON.stringify(i)));
  await mongoose.disconnect();
}

checkEnrollments().catch(console.error);
