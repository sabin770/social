const mongoose = require('mongoose');
const { MongodbConfig } = require("./config");

const connectDB = async () => {
    try {
        await mongoose.connect(MongodbConfig.url, {
            dbName: MongodbConfig.name,
            autoCreate: true,
            autoIndex: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;