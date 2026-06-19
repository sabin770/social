require("dotenv").config({ override: true });

const MongodbConfig = {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017/",
    name: process.env.MONGODB_NAME || "social",
}

module.exports = { MongodbConfig }