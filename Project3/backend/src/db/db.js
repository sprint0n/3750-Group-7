const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is not set in .env");
  process.exit(1);
}

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri, {});
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

module.exports = {
  connectToDatabase,
  mongoose,
};
