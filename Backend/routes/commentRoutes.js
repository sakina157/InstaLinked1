const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/post");

// Add a comment to a post
router.post("/add", async (req, res) => {
  try {
    const { postId, userId, text } = req.body;

    if (!postId || !userId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comment({ postId, userId, text });
    await newComment.save();

    // Optionally update post with the comment count
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Get comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).populate("userId", "email"); // Populate user email if needed
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Delete a comment
router.delete("/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
