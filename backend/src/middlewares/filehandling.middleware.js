const multer = require("multer");
const fs = require("fs");
const path = require("path");

/**
 * uploader(dir) - returns a configured multer instance that stores
 * images on disk under ./public/uploads/<dir>
 */
const uploader = (dir = "misc") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(__dirname, "..", "..", "public", "uploads", dir);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, fileName);
    },
  });

  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb({
        code: 422,
        message: "Only image files (jpg, jpeg, png, gif, webp) are allowed",
        status: "ERR_INVALID_FILE_FORMAT",
      });
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

module.exports = uploader;
