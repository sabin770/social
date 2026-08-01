const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const router = require("./router.config");
const errorHandling = require("../middlewares/error-handling.middleware");
const { AppConfig } = require("./config");

const app = express();

// security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images to be loaded cross-origin by the frontend
  })
);

// CORS - allow frontend origin & cookies
app.use(
  cors({
    origin: AppConfig.frontendUrl,
    credentials: true,
  })
);

// body & cookie parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// sanitize against NoSQL injection (e.g. $gt, $where in req.body/query/params)
app.use(mongoSanitize());

// static files (uploaded images)
app.use("/uploads", express.static("./public/uploads"));

// health check
app.get("/", (req, res) => {
  res.json({ data: null, message: "Grenary API is healthy", status: "OK" });
});

// mount API routes
app.use("/api", router);

// 404 handler
app.use((req, res, next) => {
  next({ code: 404, message: "Route not found", status: "ERR_NOT_FOUND" });
});

// centralized error handler
app.use(errorHandling);

module.exports = app;
