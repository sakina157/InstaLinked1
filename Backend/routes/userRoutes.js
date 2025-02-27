const express = require("express");
const { updateUsername, followUser, unfollowUser, getUserProfile, getUser } = require("../controllers/userController");
const User = require("../models/user");

const router = express.Router();

router.post("/update-username", updateUsername);
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);

router.get("/profile/:email", getUserProfile);
router.get("/users/:userId", getUser);

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