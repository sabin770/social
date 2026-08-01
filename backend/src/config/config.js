require("dotenv").config({ override: true });

const MongodbConfig = {
  url: process.env.MONGODB_URL || "mongodb://127.0.0.1:27017",
  name: process.env.MONGODB_NAME || "grenary",
};

const AppConfig = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "dev_secret_please_change",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

module.exports = { MongodbConfig, AppConfig };
