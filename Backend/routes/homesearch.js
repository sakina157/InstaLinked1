const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Search users by email or username
router.get("/search", async (req, res) => {
    const { q } = req.query;
    console.log("Received search request:", q);
    if (!q || typeof q !== "string" || !q.trim()) {
        console.log("Search query is empty or invalid");
        return res.status(400).json({ message: "Search query is required and must be a non-empty string" });
    }
    try {
        const users = await User.find({
            $or: [
                { email: { $regex: q, $options: "i" } },
                { username: { $regex: q, $options: "i" } }
            ]
        }).select("-password -otp -otpExpires");
        console.log("Search Results:", users);
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error in search:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
module.exports = router;
