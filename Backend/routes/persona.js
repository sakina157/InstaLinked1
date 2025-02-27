const express = require("express");
const User = require("../models/user");

const router = express.Router();

// ✅ Route: Update Persona
router.post("/persona", async (req, res) => {
  const { email, persona, username } = req.body;
  console.log("🔹 Incoming request to /api/persona");
  console.log("persona is null:",persona);

  try {
    
   
    if (!email || !persona || !username) {
      console.log("❌ Missing fields:", { email, persona, username });
      return res.status(400).json({ message: "Email, persona, and username are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(401).json({ message: "User not found" });
    }

    user.persona = persona;
    user.username = username;
    await user.save();
    console.log("✅ Persona updated successfully:", user);
    res.status(200).json({ message: "Persona updated successfully" });
  } catch (error) {
    console.error("❌ Error updating persona:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Route: Get Persona by Email
router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email.trim();
    const user = await User.findOne({ email }).select("persona");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ persona: user.persona });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;