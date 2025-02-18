const Reel = require("../models/Reel");

// Create a new reel
const createReel = async (req, res) => {
  try {
    const { userId, video, category } = req.body;
    const newReel = new Reel({ userId, video, category, likes: [], comments: [] });
    await newReel.save();
    res.status(201).json(newReel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all reels
const getReels = async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { createReel, getReels };

