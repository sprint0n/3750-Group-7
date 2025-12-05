const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("MongoDB already connected.");
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is missing in .env file");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri); 
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
  }
}

module.exports = connectDB;