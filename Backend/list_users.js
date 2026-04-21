const mongoose = require('mongoose');
require('dotenv').config();

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({ name: String, phone: String, email: String }));
  const users = await User.find({});
  console.log(`Total users: ${users.length}`);
  users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Phone: ${u.phone}`));
  await mongoose.disconnect();
}

listUsers().catch(console.error);
