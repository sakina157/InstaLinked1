const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who uploaded the reel
  videoUrl: { type: String, required: true }, // Cloudinary URL for reel video
  caption: { type: String }, // Optional caption
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the reel
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      time: { type: Date, default: Date.now },
    },
  ],
  time: { type: Date, default: Date.now },
});

const Reel = mongoose.model("Reel", reelSchema);
module.exports = Reel;
