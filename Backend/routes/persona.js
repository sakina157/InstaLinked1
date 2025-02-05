const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

// Update Persona
router.post('/persona', async (req, res) => {
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
    
    user.persona = persona;
    await user.save();

    console.log("✅ Persona updated successfully:", user);
    res.status(200).json({ message: 'Persona updated successfully.', user });
  } catch (err) {
    console.error('Error updating persona:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
