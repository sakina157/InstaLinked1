const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Related post (optional)
  reelId: { type: mongoose.Schema.Types.ObjectId, ref: "Reel" }, // Related reel (optional)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who commented
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
