const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, 
  content: { type: String, required: true },
  role: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  text: { type: String, required: true },
  image: { type: String }, // ✅ Made optional to prevent errors
  videoUrl: { type: String }, // ✅ Made optional
  pdfUrl: { type: String }, // ✅ Made optional
  audioUrl: { type: String },
  mediaType: { type: String, enum: ["image", "video", "pdf", "audio", "documentary"], required: true }, 
  category: { type: String, required: true },
  user_email: {
    type: String, // Reference to the user ID
    required: true,
    ref: 'User',
  },
  posts: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    content_type: { type: String, required: true },
    category: { type: String, required: true, default: '' },
    hashtags: { type: [String], default: [] }, // ✅ Fixed default type
    tags: { type: [String], default: [] }, // ✅ Fixed default type
    visibility: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    likes: {
      type: [
        {
          email: { type: String, required: true }, // User's email
          name: { type: String, required: true }, // User's name
        },
      ],
      default: [], // 🟢 Ensures likes is always an empty array by default
    },

    comments: {
      type: [
        {
          email: { type: String, required: true }, // User's email
          name: { type: String, required: true }, // User's name
          text: { type: String, required: true }, // Comment text
          createdAt: { type: Date, default: Date.now }, // Timestamp
        },
      ],
      default: [], // 🟢 Ensures comments is always an empty array by default
    },

    shares: {
      type: Number,
      default: 0, // 🟢 Ensures shares starts at 0 by default
    },
  }],
  
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;