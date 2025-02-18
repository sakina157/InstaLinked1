const express = require("express");
const router = express.Router();
const Reel = require("../models/Reel");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");

// Cloudinary storage for videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "instalinked_reels", // Change folder as needed
    resource_type: "video",
    allowedFormats: ["mp4", "mov", "avi"],
  },
});

const upload = multer({ storage });

// Upload a new reel
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { userId, caption } = req.body;

    if (!req.file || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newReel = new Reel({
      userId,
      caption,
      video: req.file.path,
    });

    await newReel.save();
    res.status(201).json({ message: "Reel uploaded", reel: newReel });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Like/Unlike a reel
router.post("/like/:reelId", async (req, res) => {
  try {
    const { reelId } = req.params;
    const { userId } = req.body;

    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    if (reel.likes.includes(userId)) {
      reel.likes = reel.likes.filter(id => id !== userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();
    res.json({ message: "Like updated", likes: reel.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Get all reels
router.get("/", async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
