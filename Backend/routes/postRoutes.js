const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/user"); // ✅ Added missing User model import
const upload = require("../middlewares/upload");

const router = express.Router();

/* 🚀 ✅ CREATE A NEW POST (Handles Text & Image Uploads) */
router.post("/create", upload.single("image"), async (req, res) => {
    try {
        console.log("📩 Received data:", req.body);
        console.log("🖼️ Uploaded file:", req.file);

        const { userEmail, text, category } = req.body;
        const image = req.file ? req.file.path : null; // ✅ Cloudinary image URL

        const newPost = new Post({
            userEmail,
            text,
            image,
            category,
            likes: [],
            comments: [],
        });

        await newPost.save();
        res.status(201).json({ message: "✅ Post created successfully", post: newPost });
    } catch (error) {
        console.error("❌ Error creating post:", error);
        res.status(500).json({ message: "Error creating post", error });
    }
});

/* 🚀 ✅ GET ALL POSTS (Including Images) */
router.get("/all", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching posts", error });
    }
});

/* 🚀 ✅ GET POSTS BY USER EMAIL */
router.get("/user/:email", async (req, res) => {
    try {
        const posts = await Post.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching user's posts", error });
    }
});

/* 🚀 ✅ DELETE A POST */
router.delete("/delete/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "✅ Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error deleting post", error });
    }
});

/* 🚀 ✅ FETCH RANDOM POSTS (Excluding Followed Users) */
router.get("/random-posts/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "❌ User not found" });
        }

        // Fetch 5-6 random posts, excluding followed users
        const randomPosts = await Post.aggregate([
            { $match: { userEmail: { $ne: userId, $nin: user.following } } }, // Exclude followed users
            { $sample: { size: 6 } }, // Get 6 random posts
        ]);

        res.status(200).json(randomPosts);
    } catch (error) {
        console.error("❌ Error fetching random posts:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

/* 🚀 ✅ LIKE/UNLIKE A POST */
router.post("/like/:postId", async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) return res.status(404).json({ message: "❌ Post not found" });

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

/* 🚀 ✅ COMMENT ON A POST */
router.post("/comment/:postId", async (req, res) => {
    try {
        const { userId, text } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) return res.status(404).json({ message: "❌ Post not found" });

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
