'use strict';

const mongoose = require('mongoose');

const RETRY_DELAY_MS = 10000; // 10 seconds between retries

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

  const tryConnect = async () => {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected: ${mongoose.connection.host}`);
    } catch (err) {
      console.warn(`[MongoDB] Not available (${err.message.split(',')[0].trim()}). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(tryConnect, RETRY_DELAY_MS);
    }
  };

  // Handle disconnection — auto-reconnect
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected. Attempting to reconnect...');
    setTimeout(tryConnect, RETRY_DELAY_MS);
  });

  mongoose.connection.on('error', (err) => {
    console.warn(`[MongoDB] Error: ${err.message}`);
  });

  await tryConnect();
};

// Helper: is the DB currently connected?
const isConnected = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, isConnected };
