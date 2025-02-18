const User = require("../models/user");

const updateUsernameAndPersona = async (req, res) => {
  try {
    const { userId, username, persona } = req.body;

    if (!userId || !username || !persona) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username;
    user.persona = persona;
    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Follow a user
const followUser = async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.following.includes(targetUserId)) {
            user.following.push(targetUserId);
            targetUser.followers.push(userId);
            await user.save();
            await targetUser.save();
        }

        res.json({ message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        user.following = user.following.filter(id => id !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id !== userId);

        await user.save();
        await targetUser.save();

        res.json({ message: "User unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

//
const getUserProfile = async (req, res) => {
  try {
      const email = req.params.email.trim();
      console.log("Fetching user profile for email:", email); // Debugging

      const user = await User.findOne({ email }).select("-password"); // Exclude password for security

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      console.log("MongoDB Fetched User:", user); // Debugging

      res.json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,  // Ensure correct username is returned
          profileImage: user.profileImage,
          persona: user.persona
      });
  } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


  //

  const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
};




  

module.exports = { updateUsernameAndPersona, followUser, unfollowUser, getUserProfile, getUser };




