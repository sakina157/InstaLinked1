const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Search users by email or username
router.get("/search", async (req, res) => {
    console.log("Received search request:", req.query);
    try {
        const { q } = req.query; // Get search query

        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Search in email and username fields (case-insensitive)
        const users = await User.find({
            $or: [
                { email: { $regex: q, $options: "i" } },
                { username: { $regex: q, $options: "i" } }
            ]
        }).select("-password -otp -otpExpires"); // Exclude sensitive data

        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error in search:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
