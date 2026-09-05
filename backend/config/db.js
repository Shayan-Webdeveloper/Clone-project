const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers(
  (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
);

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