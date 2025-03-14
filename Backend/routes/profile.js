const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../models/user"); 
const {createProfile,upload,getUser }=require("../controllers/profileController")

router.post("/create-profile",upload.single('profileImage'),createProfile)
router.get("/getUsers",getUser)


// Fetch user by ID
router.get("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id.trim(); // 🛠 Trim whitespace
        console.log("Received user ID:", userId); // Debugging log

        // ✅ Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // 🔍 Fetch user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
  

module.exports = router;
