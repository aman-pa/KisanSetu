const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const autoSeedIfEmpty = require('../seed/autoSeed');

let mongoServer = null;

const connectDB = async () => {
  try {
    // Attempt local MongoDB service first with 5s timeout
    console.log('[Database] Checking local MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kisansetu', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to local MongoDB service.`);
    await autoSeedIfEmpty();
  } catch (err) {
    console.warn(`[Database] Local MongoDB not running (${err.message}).`);
    console.log(`[Database] Initializing persistent storage database engine...`);

    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      // Create persistent database directory inside backend/data/db
      const dbPath = path.join(__dirname, '../../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
        },
      });

      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);

      console.log(`[Database] Persistent MongoDB Database active at: ${dbPath}`);
      await autoSeedIfEmpty();
    } catch (memErr) {
      console.warn(`[Database] Persistent dbPath fallback: ${memErr.message}. Launching memory database instance...`);
      try {
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`[Database] Connected to memory database.`);
        await autoSeedIfEmpty();
      } catch (fatalErr) {
        console.error('[Database Fatal Error]', fatalErr.message);
      }
    }
  }
};

module.exports = connectDB;
