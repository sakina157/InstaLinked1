const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database');
const User = require('./models/user');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Socket: New connection established', socket.id);

    // Join a room with the user's ID
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`Socket: User ${userId} joined their room with socket ${socket.id}`);
            
            // Emit a test notification to verify the connection
            socket.emit('test', { message: 'Successfully joined notification room' });
        } else {
            console.error('Socket: Join event received without userId');
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket: User disconnected', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket: Error occurred:', error);
    });
});

// Make io accessible to our controllers
app.set('io', io);

// ✅ Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// ✅ Import Routes
const signupRoute = require('./routes/signup');
const verifyRoute = require('./routes/verify');
const resendOtpRoute = require('./routes/resendOtp');
const personaRoutes = require('./routes/persona');
const contentSelectRoutes = require('./routes/ContentSelect');
const authRoutes = require('./routes/authRoutes');
const feedRoutes = require("./routes/feed");
const uploadRoutes = require("./routes/uploadRoutes");
const commentRoutes = require("./routes/commentRoutes");
const CreatePostRoute = require('./routes/CreatePostRoute');
const homesearchRoutes = require("./routes/homesearch");
const profileRoutes = require("./routes/profile");
const usernameRoutes = require("./routes/username");
const exploreRoutes = require('./routes/exploreRoutes');
const followRoutes = require('./routes/followRoutes');

// ✅ Debugging: Confirm Routes are Loaded
console.log("✅ Persona route loaded: /api/persona");
console.log("✅ Homesearch route loaded: /api/homesearch/search");
console.log("✅ Follow routes loaded: /api/follow");

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
app.use("/api/comments", commentRoutes);
app.use('/api', CreatePostRoute);
app.use("/api/homesearch", homesearchRoutes);
app.use("/api", profileRoutes);
app.use("/api", usernameRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);

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

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Global Error:", err.stack);
    res.status(500).json({ message: "Something went wrong on the server!" });
});

// ✅ Connect to MongoDB and Start Server
connectDB()
    .then(() => {
        console.log("✅ Connected to MongoDB");
        server.listen(5500, () => {
            console.log('Server is running on port 5500');
        });
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
    });

module.exports = { app, io };