const errorHandling = (error, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  let code = error.code || 500;
  let detail = error.detail || error.details || null;
  let message = error.message || "Internal server error";
  let status = error.status || "ERR_APP_SERVER_ERROR";

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    code = 400;
    message = "Validation failed";
    status = "ERR_VALIDATION";
    detail = {};
    Object.keys(error.errors).forEach((field) => {
      detail[field] = error.errors[field].message;
    });
  }

  // Mongo duplicate key errors
  if (error.name === "MongoServerError" && error.code === 11000) {
    code = 400;
    message = "Duplicate value error";
    status = "ERR_DUPLICATE_KEY";
    detail = {};
    Object.keys(error.keyValue || {}).forEach((field) => {
      detail[field] = `${field} already exists`;
    });
  }

  // Invalid ObjectId cast errors
  if (error.name === "CastError") {
    code = 400;
    message = "Invalid ID format";
    status = "ERR_INVALID_ID";
  }

  // Multer errors
  if (error.name === "MulterError") {
    code = 400;
    message = error.message;
    status = "ERR_FILE_UPLOAD";
  }

  if (!Number.isInteger(code)) {
    code = 500;
  }

  res.status(code).json({
    data: null,
    error: detail,
    message,
    status,
  });
};

module.exports = errorHandling;
