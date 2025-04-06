const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const User = require("../models/user");
const Post = require("../models/post");
const util = require('util');

const router = express.Router();

// ✅ Improved Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'pdf'],
    resource_type: 'auto'
  }
});

// Test Cloudinary configuration
cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary Configuration is valid:', result))
  .catch(error => console.error('❌ Cloudinary Configuration Error:', error));

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    console.log("🧐 Checking File Type:", file.mimetype);
    // More precise MIME type checking
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'audio/mpeg', 'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type! Allowed types: ${allowedMimes.join(', ')}`), false);
    }
  }
});

// ✅ Corrected API Route with better error handling
router.post("/", async (req, res) => {
  try {
    // Handle file upload first
    const uploadMiddleware = util.promisify(upload.single('file'));
    await uploadMiddleware(req, res);

    const { email, caption, tags, hashtags, visibility, type, category } = req.body;

    // Log the entire request file object for debugging
    console.log("📂 File object:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!type || !category) {
      return res.status(400).json({ error: "Content type and category are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create new post with required fields
    const newPost = new Post({
      user_email: user.email,
      url: req.file.path, // Cloudinary URL
      content_type: type,
      category: category || 'General', // Default category if none provided
      caption: caption || '',
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
      tags: tags || '',
      visibility: visibility || 'public'
    });

    await newPost.save();
    console.log("📌 New Post Created:", newPost);

    res.status(201).json({ 
      message: "Post created successfully!", 
      post: newPost,
      file: {
        url: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ 
      error: "File upload failed", 
      details: error.message 
    });
  }
});

module.exports = router;