const multer = require("multer");

// Configure storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
