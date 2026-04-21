/**
 * Creates database arenacrmtest and collection arenacrmtest on the cluster (idempotent).
 * Usage: node scripts/createArenacrmtestCollection.js
 * Requires MONGODB_URI in .env (database path in URI is overridden for this script).
 */
require('dotenv').config();
const mongoose = require('mongoose');

const TARGET_DB = 'arenacrmtest';
const TARGET_COLLECTION = 'arenacrmtest';

function uriWithDatabase(uri, dbName) {
  if (!uri) throw new Error('MONGODB_URI is not set');
  const qIndex = uri.indexOf('?');
  const base = qIndex === -1 ? uri : uri.slice(0, qIndex);
  const query = qIndex === -1 ? '' : uri.slice(qIndex);
  const hostMatch = base.match(/^(mongodb(\+srv)?:\/\/[^/]+)(\/?.*)?$/);
  if (!hostMatch) throw new Error('Could not parse MONGODB_URI');
  const prefix = hostMatch[1];
  return `${prefix}/${dbName}${query}`;
}

async function main() {
  const uri = uriWithDatabase(process.env.MONGODB_URI, TARGET_DB);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const exists = await db
    .listCollections({ name: TARGET_COLLECTION })
    .hasNext();
  if (!exists) {
    await db.createCollection(TARGET_COLLECTION);
    // eslint-disable-next-line no-console
    console.log(`Created collection "${TARGET_COLLECTION}" in database "${TARGET_DB}".`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Collection "${TARGET_COLLECTION}" already exists in database "${TARGET_DB}".`);
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
