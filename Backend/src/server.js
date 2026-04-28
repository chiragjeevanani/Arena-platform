const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { createApp } = require('./app');

loadEnv();

const port = Number(process.env.PORT) || 5000;

// ANSI Color Codes
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const CHECK = '✔';

async function start() {
  console.log(`${BLUE}Starting Arena CRM Backend...${RESET}`);

  // 1. Connect MongoDB
  await connectDB();
  console.log(`${GREEN}${CHECK} MongoDB Connected Successfully${RESET}`);

  // 2. Configure Cloudinary
  try {
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      configureCloudinary();
      console.log(`${GREEN}${CHECK} Cloudinary Configured Successfully${RESET}`);
    } else {
      console.warn('Cloudinary not configured: Missing environment variables');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Cloudinary configuration failed:', e.message);
  }

  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`${GREEN}${CHECK} Server is running on port ${port}${RESET}`);
    console.log(`${BLUE}----------------------------------------${RESET}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('\x1b[31m✘ Failed to start server\x1b[0m', err);
  process.exit(1);
});

