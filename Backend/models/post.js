const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user_email: {
    type: String, // Reference to the user ID
    required: true,
    ref: 'user',
  },
  url: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  content_type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: '',
  },
  hashtags: {
    type: [String],
    default: [],
  },
  tags: {
    type: String,
    default: '',
  },
  visibility: {
    type: String,
    default: 'public',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: [{
      email: { type: String, required: true },
      name: { type: String, required: true },
    }],
    default: [],
  },
  comments: {
    type: [{
      email: { type: String, required: true },
      name: { type: String, required: true },
      comment: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    }],
    default: [],
  },
  shares: {
    type: Number,
    default: 0, // 🟢 Ensures shares starts at 0 by default
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;