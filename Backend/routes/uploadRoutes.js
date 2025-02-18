const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");

const router = express.Router();

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "instalinked_uploads", // Cloudinary folder name
    format: async (req, file) => "jpeg", // Ensures correct format
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Unique filename
  },
});

const upload = multer({ storage });

// Route to upload an image
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Image upload failed", details: error.message });
  }
});

module.exports = router;
