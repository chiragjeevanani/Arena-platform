const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../src/models/User');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);

  const allUsers = await User.find({}).lean();
  console.log(`Found ${allUsers.length} users total:`);
  allUsers.forEach(u => {
    console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, isEmailVerified: ${u.isEmailVerified}`);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
