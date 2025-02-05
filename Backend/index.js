const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const connectDB = require('./database');
const User = require('./models/user'); 


dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Import and use routes BEFORE starting the server
const signupRoute = require('./routes/signup');
const verifyRoute = require('./routes/verify'); 
const resendOtpRoute = require('./routes/resendOtp');
const personaRoutes = require('./routes/persona');
const ContentSelectRoutes = require('./routes/ContentSelect');

app.use('/api', signupRoute);
app.use('/api', verifyRoute);
app.use('/api', resendOtpRoute);
app.use('/api', personaRoutes);
app.use('/api', ContentSelectRoutes);

// ✅ Function to Delete Unverified Users Automatically
const deleteUnverifiedUsers = async () => {
  const now = Date.now();
  const deletedUsers = await User.deleteMany({
    isVerified: false,
    otpExpires: { $lt: now } // Remove users whose OTP expired
  });

  if (deletedUsers.deletedCount > 0) {
    console.log(`Deleted ${deletedUsers.deletedCount} unverified users.`);
  }
};

// ✅ Run Cleanup Every 10 Minutes
setInterval(deleteUnverifiedUsers, 10 * 60 * 1000); // Runs every 10 mins

// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
