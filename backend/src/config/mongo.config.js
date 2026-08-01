const mongoose = require("mongoose");
const { MongodbConfig } = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(MongodbConfig.url, {
      dbName: MongodbConfig.name,
      autoCreate: true,
      autoIndex: true,
    });
    console.log(`MongoDB connected successfully -> ${MongodbConfig.url}/${MongodbConfig.name}`);
  } catch (exception) {
    console.error("MongoDB connection error:", exception.message);
    process.exit(1);
  }
};

module.exports = connectDB;
