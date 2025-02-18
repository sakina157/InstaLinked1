const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");

// Fetch personalized feed
router.get("/feed/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch posts in a **single** query
        const feed = await Post.find({
            $or: [
                { userId: { $in: user.following } }, // Followed users' posts
                { category: { $in: user.preferences } } // Preferred content
            ]
        });

        // Shuffle feed randomly
        const shuffledFeed = feed.sort(() => Math.random() - 0.5);

        res.json(shuffledFeed);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Like/Unlike a post
router.post("/like/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const likeIndex = post.likes.findIndex(id => id.toString() === userId);

        if (likeIndex === -1) {
            post.likes.push(userId); // Like the post
        } else {
            post.likes.splice(likeIndex, 1); // Unlike the post
        }

        await post.save();
        res.json({ message: "Like updated", likes: post.likes.length });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;
