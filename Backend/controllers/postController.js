const Post = require("../models/post");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { userId, text, image, category } = req.body;
    const newPost = new Post({ userId, text, image, category, likes: [], comments: [] });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { createPost, getPosts };
