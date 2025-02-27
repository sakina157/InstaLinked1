const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, 
  content: { type: String, required: true },
  role: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  text: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary image URL
  videoUrl: { type: String, required: true }, // Cloudinary URL for the post’s video
  pdfUrl: { type: String, required: true }, // Cloudinary URL for the post’s PDF
  audioUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video", "pdf", "audio"], required: true }, // Add this field
  category: { type: String, required: true },
  likes: {type: Array, default: []}, 
  comments:  { type: Array, default: []},
  user_email: {
    type: String, // Reference to the user ID
    required: true,
    ref: 'User',
  },
     
    
  
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
