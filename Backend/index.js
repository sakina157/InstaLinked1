const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database');
const User = require('./models/user');
const Post = require('./models/post');
const Persona = require('./models/persona');


dotenv.config();
const app = express();


// ✅ Improved CORS Configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// ✅ Middleware
app.use(express.json());

// ✅ Connect to MongoDB (Handle Errors Gracefully)
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// ✅ Import Routes
const signupRoute = require('./routes/signup');
const verifyRoute = require('./routes/verify');
const resendOtpRoute = require('./routes/resendOtp');
const personaRoutes = require('./routes/persona');
const contentSelectRoutes = require('./routes/ContentSelect');
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require("./routes/feed");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const reelRoutes = require("./routes/reelRoutes");
const commentRoutes = require("./routes/commentRoutes");
const CreatePostRoute = require('./routes/CreatePostRoute');
const homeSearchRoutes = require("./routes/homesearch");
const profileRoutes = require("./routes/profile");


// ✅ Debugging: Confirm Persona Route is Loaded
console.log("✅ Persona route loaded: /api/persona");

// ✅ Use Routes
app.use('/api', signupRoute);
app.use('/api', verifyRoute);
app.use('/api', resendOtpRoute);
app.use('/api', personaRoutes);
app.use('/api', contentSelectRoutes);
app.use('/api/auth', authRoutes);
app.use("/api", feedRoutes);
app.use("/api", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api', CreatePostRoute);
app.use("/api", homeSearchRoutes);
app.use("/api", profileRoutes);


// ✅ Create Post API
app.post('/api/posts', async (req, res) => {
  try {
      console.log("📩 Received Post Data:", req.body);

      const { userId, content, role, text, image } = req.body;

      if (!userId || !content || !role || !text) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const newPost = new Post({
          userId,
          content,
          role,
          text,
          image,
          likes: [],
          comments: []
      });

      await newPost.save();
      res.status(201).json({ message: "Post created successfully!", post: newPost });

  } catch (error) {
      console.error("❌ Error saving post:", error);
      res.status(500).json({ error: "Server error" });
  }
});

// ✅ Function to Delete Unverified Users
const deleteUnverifiedUsers = async () => {
  try {
    const now = Date.now();
    const deletedUsers = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: new Date(now - 10 * 60 * 1000) } 
    });
    
    if (deletedUsers.deletedCount > 0) {
      console.log(`🗑 Deleted ${deletedUsers.deletedCount} unverified users.`);
    }
  } catch (error) {
    console.error("❌ Error deleting unverified users:", error);
  }
};

// ✅ Run Cleanup Every 10 Minutes
setInterval(deleteUnverifiedUsers, 10 * 60 * 1000);

// ✅ Global Error Handler (Fix "Server response was not JSON.")
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
