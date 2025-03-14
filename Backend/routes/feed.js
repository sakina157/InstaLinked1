const express = require("express");
const { homePage} = require('../controllers/homeController');
const router = express.Router();
const User = require("../models/user");

// Fetch user data by email
router.get("/user/data", async (req, res) => {
  console.log("Received Request Headers:", req.headers);
    console.log("Received Request Query:", req.query);
    console.log("Received Request Body:", req.body);
  
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

router.get('/feed/homepage', homePage);


module.exports = router;