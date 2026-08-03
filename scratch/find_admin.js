const path = require('path');
const backendDir = 'd:/Appzeto_Projects/Arena-platform/Backend';
require(path.join(backendDir, 'node_modules/dotenv')).config({ path: path.join(backendDir, '.env') });
const mongoose = require(path.join(backendDir, 'node_modules/mongoose'));

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Total users in DB:', users.length);
    const admins = users.filter(u => ['SUPER_ADMIN', 'ARENA_ADMIN', 'ADMIN'].includes(u.role));
    console.log('Admins found:', JSON.stringify(admins.map(u => ({ email: u.email, role: u.role, name: u.name, phone: u.phone })), null, 2));
    
    if (users.length > 0) {
      console.log('All user emails & roles in DB:');
      users.forEach(u => console.log(`- Email: ${u.email} | Role: ${u.role} | Name: ${u.name}`));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAdmins();
