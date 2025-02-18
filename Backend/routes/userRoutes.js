const express = require("express");
const { updateUsernameAndPersona, followUser, unfollowUser, getUserProfile, getUser } = require("../controllers/userController");
const mongoose = require("mongoose");
const User = require("../models/user");

const router = express.Router();

router.post("/update-profile", updateUsernameAndPersona);
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);

router.get("/profile/:email", getUserProfile);
router.get("/users/:userId", getUser);


router.get("/:id", async (req, res) => {
  try {
      let userId = req.params.id.trim();
      console.log("Received user ID:", userId);

      let user;
      
      // First, try to find by ObjectId if it's valid
      if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findById(userId);
      }

      // If no user found and _id might be a string, try finding as a string
      if (!user) {
          user = await User.findOne({ _id: userId });
      }

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
