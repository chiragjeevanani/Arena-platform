const mongoose = require('mongoose');

async function connectDB(uri) {
  const connectionString = uri || process.env.MONGODB_URI;
  if (!connectionString) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);
  // mongoose.set('debug', true); // Uncomment for full operation logs
  
  const options = {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    family: 4, // Force IPv4 to avoid DNS resolution issues with SRV
  };

  await mongoose.connect(connectionString, options);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDB, disconnectDB };
