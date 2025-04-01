const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");

// Configure storage for uploaded files
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "instalinked_posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mp3", "pdf"],
    resource_type: "auto"
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    if (["image/", "video/", "application/pdf", "audio/"].some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type! Only images, videos, PDFs and audio files are allowed."), false);
    }
  }
});


module.exports = upload;
