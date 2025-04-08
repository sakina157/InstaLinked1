const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const speakeasy = require("speakeasy");
const admin = require("../firebase");
const Notification = require("../models/notification");
require("dotenv").config();

const loginWithGoogle = async (req, res) => {
  try {
      const { firebaseToken } = req.body;
      if (!firebaseToken) {
          return res.status(400).json({ message: "Google Token is required" });
      }

      // ✅ Verify Firebase Token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const { email, name, picture, uid } = decodedToken;

      // ✅ Check if user exists in MongoDB
      let user = await User.findOne({ email });

      if (!user) {
          // ✅ Create a new user in MongoDB
          user = new User({
              fullName: name || "New User",
              email,
              profileImage: picture || "",
              isVerified: true, // Google signups are auto-verified
              firebaseUID: uid, // Store Firebase UID
          });
          await user.save();
      }

      // ✅ Generate JWT Token
      const token = jwt.sign(
          { userId: user._id, username: user.username, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
      );

      res.status(200).json({
          message: "Google login successful",
          token,
          user: {
              _id: user._id,
              fullName: user.fullName,
              email: user.email,
              username: user.username || "New User",  
              profileImage: user.profileImage,
              persona: user.persona
          }
      });

  } catch (error) {
      console.error("Google Login Error:", error);
      res.status(500).json({ message: "Server error", error });
  }
};


/*
// Initialize Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);*/

// **Google Signup**
const googleSignup = async (req, res) => {
  try {
      const { firebaseToken } = req.body;

      if (!firebaseToken) {
          return res.status(400).json({ message: "Firebase token is required." });
      }

      // Verify Firebase ID Token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

      if (!decodedToken.email) {
          return res.status(400).json({ message: "No email found in Firebase token." });
      }

      const { email, name, picture, uid } = decodedToken;

      let user = await User.findOne({ email });

      if (!user) {
          user = new User({
              fullName: name,
              email,
              profileImage: picture,
              firebaseUID: uid,  // Store Firebase UID in MongoDB
              isVerified: true, // Google signups are auto-verified
          });
          await user.save();
      }

      // Generate JWT Token
      const token = jwt.sign(
          { userId: user._id, email: user.email, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
      );

      res.status(200).json({
          message: "Google signup successful",
          token,
          user: {
              _id: user._id,
              fullName: user.fullName,
              email: user.email,
              username: user.username,
              profileImage: user.profileImage,
              persona: user.persona
          }
      });

  } catch (error) {
      console.error("Google Signup Error:", error);
      res.status(500).json({ message: "Server error", error });
  }
};

/*
// **Facebook Signup**
const facebookSignup = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: "Facebook access token is required." });
        }

        // Verify Facebook token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(accessToken);

        if (!decodedToken.email) {
            return res.status(400).json({ message: "Facebook login failed: No email provided." });
        }

        const { email, name, picture } = decodedToken;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                fullName: name,
                email,
                profileImage: picture || "",
                isVerified: true, // Facebook signups are auto-verified
            });
            await user.save();
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Facebook signup successful",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
                persona: user.persona
            }
        });

    } catch (error) {
        console.error("Facebook Signup Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}; */

// Register User with OTP
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, fullName, profileImage, isGoogleSignup } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({ message: "User already exists", userId: existingUser._id });
    }

    let hashedPassword = null;
    let isVerified = false;

    if (!isGoogleSignup) {
      if (!password || !confirmPassword) {
        return res.status(400).json({ message: "Password and confirm password are required." });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      isVerified = true;  // Google users are auto-verified
    }

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      profileImage,
      isVerified
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// OTP Verification
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Check Username Availability
const checkUsernameAvailability = async (req, res) => {
  const { username } = req.params;  // <-- Make sure you are using req.params
  if (!username) {
      return res.status(400).json({ message: "Username is required" });
  }
  
  const userExists = await User.findOne({ username });  // <-- Ensure this query is correct
  if (userExists) {
      return res.json({ exists: true });
  }
  
  return res.json({ exists: false });
};

 
// Login User
const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { username: emailOrPhone }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,  
        profileImage: user.profileImage,
        persona: user.persona
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Requested user ID:", userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,  // Ensure the correct username is returned
      profileImage: user.profileImage,
      persona: user.persona
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//

const getUserByEmail = async (req, res) => {
  try {
      const { email } = req.params;
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error("Error fetching user by email:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
    try {
        // Clear JWT token cookie
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.body;

        // Delete user's notifications
        await Notification.deleteMany({
            $or: [
                { recipient: userId },
                { sender: userId }
            ]
        });

        // Delete the user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear JWT token cookie
        res.clearCookie('token');
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};

module.exports = { register, verifyOTP, checkUsernameAvailability, login, getUser, getUserByEmail, loginWithGoogle, googleSignup, logout, deleteAccount, changePassword }; 


