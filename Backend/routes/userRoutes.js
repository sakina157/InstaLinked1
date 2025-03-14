const express = require("express");
const { updateUsername, followUser, unfollowUser, getUserProfile, getUser, getFollowers, getFollowing } = require("../controllers/userController");
const User = require("../models/user");

const router = express.Router();

// User profile routes
router.get("/profile/:email", getUserProfile);
router.get("/:userId", getUser);

// Follow/Unfollow routes
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);

// Followers/Following routes
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Firebase route
router.get("/firebase/:firebaseUID", async (req, res) => {
    try {
        const { firebaseUID } = req.params;
        console.log("Received Firebase UID:", firebaseUID);

        const user = await User.findOne({ firebaseUID });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;