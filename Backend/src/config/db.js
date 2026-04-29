const mongoose = require('mongoose');

async function connectDB(uri, retries = 3) {
  const connectionString = uri || process.env.MONGODB_URI;
  if (!connectionString) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);
  
  const options = {
    connectTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
    family: 4, // Force IPv4 to avoid DNS resolution issues with SRV
  };

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(connectionString, options);
      return mongoose.connection;
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 1000;
      console.log(`\x1b[33m⚠ MongoDB connection attempt ${i + 1} failed. Retrying in ${delay}ms...\x1b[0m`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDB, disconnectDB };
