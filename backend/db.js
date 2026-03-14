const mongoose = require('mongoose');

/**
 * Connects to MongoDB with robust error handling.
 * Detects if local server is down and prevents app crash.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myapp';
  
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  };

  try {
    await mongoose.connect(mongoURI, options);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    
    // Check if the error is due to local server not running
    if (err.message.includes('ECONNREFUSED') || err.name === 'MongooseServerSelectionError') {
      console.error('\n' + '='.repeat(50));
      console.error('🚨 DATABASE CONNECTION FAILED');
      console.error('='.repeat(50));
      console.error('Cause: Could not connect to MongoDB server.');
      
      if (mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
        console.error('Hint: It seems your LOCAL MongoDB server is not running.');
        console.error('Fix: Run "mongod" in your terminal or start the MongoDB service.');
      } else {
        console.error('Hint: Check your MONGO_URI in .env and your network/IP whitelist.');
      }
      console.error('='.repeat(50));
      console.error('🚀 App is running, but database features will NOT work until fixed.\n');
    }
    
    // Note: No process.exit(1) here as per requirement to prevent app crash
  }

  // Monitor connection events
  mongoose.connection.on('error', (err) => {
    console.error(`🔴 MongoDB post-connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('🟡 MongoDB disconnected. Database operations may fail.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });
};

module.exports = connectDB;