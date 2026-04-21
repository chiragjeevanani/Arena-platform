const mongoose = require('mongoose');
require('dotenv').config();

async function updateUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({ phone: String }, { strict: false }), 'users');
  const res = await User.updateOne(
    { _id: new mongoose.Types.ObjectId('69e4e052cc1cc5799849116f') },
    { $set: { phone: '8989898989' } }
  );
  console.log(`Updated user: ${res.modifiedCount}`);
  await mongoose.disconnect();
}

updateUser().catch(console.error);
