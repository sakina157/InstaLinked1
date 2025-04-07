const express = require("express");
const Post = require("../models/post");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");

// Get a single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    // Get user details
    const user = await User.findOne({ email: post.user_email });
    
    // Combine post data with user details
    const postWithUser = {
      ...post.toObject(),
      user: {
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        email: user.email
      }
    };
    
    res.json(postWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a post
router.post("/:id/like", async (req, res) => {
  try {
    const { email, name } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userLikeIndex = post.likes.findIndex(like => like.email === email);
    
    if (userLikeIndex === -1) {
      post.likes.push({ email, name });
    } else {
      post.likes.splice(userLikeIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Comment on a post
router.post("/:id/comment", async (req, res) => {
  try {
    const { email, name, text } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add comment using the schema structure
    const newComment = {
      email,
      name,
      comment: text, // Note: schema uses 'comment' not 'text'
      created_at: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.json(post.comments);
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Share a post
router.post("/:id/share", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.shares += 1;
    await post.save();

    res.json({ shares: post.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;