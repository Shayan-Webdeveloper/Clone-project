const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = () => {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }
  return connectionPromise;
};

module.exports = connectDB;