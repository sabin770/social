const http = require("http");
const connectDB = require("./config/mongo.config");
const app = require("./config/express.config");
const initSocket = require("./config/socket");
const { AppConfig } = require("./config/config");

(async () => {
  await connectDB();

  // Wrap express in a raw http.Server so Socket.IO can share the same port
  const httpServer = http.createServer(app);
  initSocket(httpServer, app);

  httpServer.listen(AppConfig.port, () => {
    console.log(`Grenary API running on http://localhost:${AppConfig.port}`);
    console.log(`Socket.IO attached on the same port`);
    console.log(`Environment: ${AppConfig.nodeEnv}`);
  });
})();
