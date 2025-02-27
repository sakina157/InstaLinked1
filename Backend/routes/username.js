const express = require("express");
const User = require("../models/user");

const router = express.Router();

// ✅ Check if Username Exists
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log("Checking username:", username);

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(200).json({ available: false, message: "Username already taken" });
        }

        res.status(200).json({ available: true, message: "Username available" });

    } catch (error) {
        console.error("❌ Error checking username:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Route: Update Username
router.post("/set-username", async (req, res) => {
    console.log("🔹 Incoming request to /api/set-username");
    console.log("🔹 Request body:", req.body);
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: "Email and username are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Find user by email and update username
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username;
    await user.save();

    res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Route: Get Username by Email
router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email.trim();
    const user = await User.findOne({ email }).select("username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
