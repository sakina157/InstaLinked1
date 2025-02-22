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

const getRandomPosts = async (req, res) => {
  try {
      const { userId } = req.params;

      // Check if user exists
      const userExists = await User.findById(userId);
      if (!userExists) {
          return res.status(404).json({ message: "User not found" });
      }

      // Fetch random 5-6 posts excluding the logged-in user's posts
      const posts = await Post.aggregate([
          { $match: { userId: { $ne: userId } } },
          { $sample: { size: 6 } }
      ]);

      res.json(posts);
  } catch (error) {
      console.error("Error fetching random posts:", error);
      res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createPost, getPosts, getRandomPosts };
