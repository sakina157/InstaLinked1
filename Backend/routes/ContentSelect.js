const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Update Content Preferences
router.post('/content-select', async (req, res) => {
  console.log("🔹 Received request body:", req.body);

  const { email, contentPreferences } = req.body;

  if (!email || !contentPreferences || contentPreferences.length === 0) {
    console.log("❌ Missing fields:", { email, contentPreferences });
    return res.status(400).json({ message: 'Email and content preferences are required.' });
  }

  try {
    console.log("🔍 Searching for user with email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(404).json({ message: 'User not found.' });
    }

    user.contentPreferences = contentPreferences;
    await user.save();

    console.log("✅ Content preferences updated successfully:", user.contentPreferences);
    res.status(200).json({ message: 'Content preferences updated successfully.', user });
  } catch (err) {
    console.error('❌ Error updating content preferences:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
