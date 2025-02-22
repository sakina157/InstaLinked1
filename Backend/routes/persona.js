const express = require("express");
const router = express.Router();
const User = require("../models/user");



// ✅ Check if username already exists
router.get("/check-username/:username", async (req, res) => {
  console.log("🌍 Received request for username:", req.params.username); // Debugging

  const { username } = req.params;

  if (!username) {
    console.error("❌ No username received");
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const existingUser = await User.findOne({ username: username.trim() });

    console.log("🔍 Database Check:", existingUser); // Debugging

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error("❌ Error checking username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Set Username
router.post("/set-username", async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: "Username and email are required." });
  }

  try {
    // ✅ Check if the username is taken by another user
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.email !== email) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // ✅ Find user by email and update username
    const user = await User.findOneAndUpdate(
      { email },
      { username },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("✅ Username updated successfully:", user);
    res.status(200).json({ message: "Username updated successfully.", user });
  } catch (err) {
    console.error("❌ Error updating username:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ Set Persona (After Username Selection)
router.post('/', async (req, res) => {
  console.log("🔹 Incoming request to /api/persona");
  console.log("🔹 Received request body:", req.body);

  const { email, persona } = req.body;

  if (!email || !persona || persona.length === 0) {
    console.log("❌ Missing fields:", { email, persona });
    return res.status(400).json({ message: 'Email and persona are required.' });
  }

  try {
    console.log("🔍 Searching for user with email:", email);

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // ✅ Save Persona in Persona Collection
    let personaRecord = await Persona.findOne({ email });

    if (personaRecord) {
      personaRecord.persona = persona;
    } else {
      personaRecord = new Persona({ email, username: user.username, persona });
    }
    
    await personaRecord.save();

    console.log("✅ Persona updated successfully:", personaRecord);
    res.status(200).json({ message: 'Persona updated successfully.', persona: personaRecord });
  } catch (err) {
    console.error('❌ Error updating persona:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});





module.exports = router;