const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const User = require("../models/user");
const Post = require("../models/post");

const router = express.Router();

// Cloudinary Storage Configuration
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

router.post("/posts", upload.single("file"), async (req, res) => {
  try {
    const { email, caption, tags, hashtags, visibility, type, category } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate file upload
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "File upload failed!" });
    }

    // Create new post
    const newPost = new Post({
      user_email: email,
      url: req.file.path,
      caption: caption || "",
      content_type: type,
      category: category,
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      visibility: visibility || "Public"
    });

    await newPost.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: newPost
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;