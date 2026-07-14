const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Add it to your environment variables.');
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;