const mongoose = require('mongoose');

async function connectDB(uri) {
  const connectionString = uri || process.env.MONGODB_URI;
  if (!connectionString) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(connectionString);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDB, disconnectDB };
