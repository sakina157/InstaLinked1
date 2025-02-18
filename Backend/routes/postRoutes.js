const express = require("express");
const Post = require("../models/post");
const upload = require("../middlewares/upload"); 

const router = express.Router();

// Create a new post
router.post("/create", async (req, res) => {
    try {
        console.log("Received data:", req.body);
        const { userEmail, text, image, category } = req.body;

        const newPost = new Post({
            userEmail,
            text,
            image,
            category,
            likes: [],
            comments: [],
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error });
    }
});

// Get all posts
router.get("/all", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
});

// Get posts by user email
router.get("/user/:email", async (req, res) => {
    try {
        const posts = await Post.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user's posts", error });
    }
});

// Delete a post
router.delete("/delete/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        await Post.findByIdAndDelete(postId);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
});

// ✅ Upload Post with Image
router.post("/create", upload.single("image"), async (req, res) => {
    try {
        console.log("Received data:", req.body);  // ✅ Log request body
        console.log("Uploaded file:", req.file);
      const { user, role, text } = req.body;
      const image = req.file ? req.file.path : null;  // ✅ Gets Cloudinary image URL
  
      const newPost = new Post({ user, role, text, image });
      await newPost.save();
  
      res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
      res.status(500).json({ message: "Error creating post", error });
    }
  });
  
  // ✅ Fetch All Posts (Including Images)
  router.get("/", async (req, res) => {
    try {
      const posts = await Post.find().populate("user", "username").sort({ createdAt: -1 });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts", error });
    }
  });
  

module.exports = router;
