const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user_email: {
    type: String, // Reference to the user ID
    required: true,
    ref: 'user',
  },
  posts: [
    {
      url: {
        type: String, // URL for image/video/article
        required: true,
      },
      caption: {
        type: String, // Caption for the post
        default: '',
      },
      content_type: {
        type: String, // Type of content (e.g., 'image', 'video', 'article')
        required: true,
         // Valid content types
      },
      category:{
        type:String,
        required:true,
        default:'',
      },
      hashtags:{
        type:[String],
        default:'',
      },
      tags:{
        type:String,
        default:'',
      },
      visibility:{
        type:String,
        default:'',
      },
      created_at: {
        type: Date, // Timestamp for when the post was created
        default: Date.now,
      },
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
    },
  ],
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;