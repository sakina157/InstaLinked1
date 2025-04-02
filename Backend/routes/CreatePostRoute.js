const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const User = require("../models/user");
const Post = require("../models/post");

const router = express.Router(); // ✅ Missing express.Router()

// ✅ Correct Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log("🔄 Uploading File:", cloudinary);

    // Extract the format from the MIME type
    let format = file.mimetype.split("/")[1];

    // Manually set the format for MP3 files
    if (file.mimetype === "audio/mpeg") {
      format = "mp3";
    }

    return {
      folder: "your-folder-name",
      format: format, // Use the extracted or manually set format
      resource_type: "auto", // Ensures correct handling of videos, PDFs, etc.
    };
  },
});
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
    fileFilter: (req, file, cb) => {
      console.log("🧐 Checking File Type:", file.mimetype);
      if (["image/", "video/", "application/pdf","audio/"].some(type => file.mimetype.startsWith(type))) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type! Only images, videos, and PDFs are allowed."), false);
      }
    }
  });

// ✅ Corrected API Route
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { email, caption, tags, hashtags, visibility, type, category } = req.body;

    // 🚨 Fix: Await User1 Lookup
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🚨 Fix: Correct File URL from Cloudinary
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "File upload failed!" });
    }
    
    console.log("📂 Uploaded File:", req.file.url);

    // ✅ Save Post to Database
    const newPost = new Post({
      user_email: user.email, // Use MongoDB User ID
      posts: [
        {
          url: req.file.path, // ✅ Store Cloudinary URL
          caption,
          content_type: type,
          category,
          hashtags,
          tags,
          visibility,
        },
      ],
    });

    await newPost.save();
    console.log("📌 New Post Created:", newPost);

    res.status(201).json({ message: "Post created successfully!", post: newPost });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;