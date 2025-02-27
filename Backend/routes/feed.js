const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");

// Fetch user data by email
router.get("/user/data", async (req, res) => {
  
  try {
    const { email } = req.query; // Get email from query params

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Normalize the email (trim and convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    console.log("Fetching feed for email:", normalizedEmail);

    // Fetch the user from the database
    const user = await User.findOne({ email: normalizedEmail });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data (username and profileImage)
    res.status(200).json({
      username: user.username,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// Fetch personalized feed
router.get("/feed", async (req, res) => {
  try {
    const { email, page = 1, limit = 10 } = req.query; // Get user email from query params
    
    // Normalize the email (trim and convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    console.log("Fetching feed for email:", normalizedEmail); // Debugging

    // Fetch the logged-in user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("User not found in database"); // Debugging
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);
    console.log("User preferences:", user.preferences); // Debugging
    console.log("User following:", user.following); // Debugging

    // Fetch posts from users the logged-in user follows AND posts matching user preferences
    const personalizedPosts = await Post.find({
      $or: [
        { userId: { $in: user.following } }, // Posts from followed users
        { category: { $in: user.preferences } }, // Posts matching user preferences
      ],
    })

    .skip((page - 1) * limit) // Skip posts for previous pages
    .limit(limit);

    console.log("Personalized posts:", personalizedPosts); // Debugging

    // Fetch random posts (e.g., 10 random posts)
    const randomPosts = await Post.aggregate([{ $sample: { size: 10 } }]);

    console.log("Random posts:", randomPosts); // Debugging

    // Combine the personalized feed and random posts
    const combinedFeed = [...personalizedPosts, ...randomPosts];

    // Remove duplicate posts
    const uniqueFeed = Array.from(new Set(combinedFeed.map(post => post._id)))
      .map(id => combinedFeed.find(post => post._id === id));

    // Shuffle the combined feed randomly
    const shuffledFeed = uniqueFeed.sort(() => Math.random() - 0.5);

    console.log("Shuffled feed:", shuffledFeed); // Debugging

    res.json(shuffledFeed);
  } catch (error) {
    console.error("❌ Error fetching feed:", error); // Debugging
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;