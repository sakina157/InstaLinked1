/* eslint-disable no-unused-vars */
const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });
  
  // Configure Multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // Save uploaded files to the "uploads" folder
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname); // Unique filename
    },
  });
  
  const upload = multer({ storage: storage });


const router = express.Router();

/* 🚀 ✅ CREATE A NEW MEDIA (Handles Text & Media Uploads) */
router.post("/create", upload.single("media"), async (req, res) => {
    try {
        console.log("📩 Received data:", req.body);
        console.log("🖼️ Uploaded file:", req.file);

        const { userEmail, text, category, mediaType } = req.body;
        let mediaUrl = null;
        if (req.file) {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    mediaUrl = result.secure_url; // ✅ Cloudinary URL

    // Optionally, delete the local file after uploading to Cloudinary
    const fs = require("fs");
    fs.unlinkSync(req.file.path); // Delete the local file
}
        const newPost = new Post({
            userEmail,
            text,
            mediaUrl,
            mediaType, // Can be "image", "video", "audio", "pdf", "documentary"
            category,
            likes: [],
            comments: [],
        });

        await newPost.save();
        res.status(201).json({ message: "✅ Media created successfully", post: newPost });
    } catch (error) {
        console.error("❌ Error creating media:", error);
        res.status(500).json({ message: "Error creating media", error });
    }
});

/* 🚀 ✅ GET ALL MEDIA (Including Images, Videos, Audio, PDFs, Documentaries) */
router.get("/all", async (req, res) => {
    console.log(req);
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching media", error });
    }
});

/* 🚀 ✅ GET MEDIA BY USER EMAIL */
router.get("/user/:email", async (req, res) => {
    try {
        const posts = await Post.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching user's media", error });
    }
});

/* 🚀 ✅ DELETE A MEDIA */
router.delete("/delete/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "✅ Media deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error deleting media", error });
    }
});

/* 🚀 ✅ FETCH RANDOM MEDIA (Excluding Followed Users) */
router.get("/random-media/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "❌ User not found" });
        }

        // Fetch 5-6 random media, excluding followed users
        const randomPosts = await Post.aggregate([
            { $match: { userEmail: { $ne: userId, $nin: user.following } } }, // Exclude followed users
            { $sample: { size: 10 } }, // Get 6 random media
        ]);

        res.status(200).json(randomPosts);
    } catch (error) {
        console.error("❌ Error fetching random media:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/* 🚀 ✅ LIKE/UNLIKE A MEDIA */
router.post("/like/:postId", async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) return res.status(404).json({ message: "❌ Media not found" });

        const userObjectId = new mongoose.Types.ObjectId(userId);

        if (post.likes.some((id) => id.equals(userObjectId))) {
            post.likes = post.likes.filter((id) => !id.equals(userObjectId)); // Remove like
        } else {
            post.likes.push(userObjectId); // Add like
        }

        await post.save();
        res.status(200).json({ message: "✅ Like updated", likes: post.likes.length });
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/* 🚀 ✅ COMMENT ON A MEDIA */
router.post("/comment/:postId", async (req, res) => {
    try {
        const { userId, text } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) return res.status(404).json({ message: "❌ Media not found" });

        const newComment = {
            userId: new mongoose.Types.ObjectId(userId),
            text,
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();
        res.status(200).json({ message: "✅ Comment added successfully", comments: post.comments });
    } catch (error) {
        console.error("❌ Error adding comment:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;