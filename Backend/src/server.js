const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { createApp } = require('./app');

loadEnv();

try {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    configureCloudinary();
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Cloudinary not configured:', e.message);
}

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Arena CRM API listening on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
