const User = require("../models/user");
const Notification = require('../models/notification');

const updateUsername = async (req, res) => {
    try {
        const { userId, username } = req.body;

        if (!userId || !username) {
            return res.status(400).json({ message: "User ID and username are required" });
        }

        // Case-insensitive check for existing username
        const existingUser = await User.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Fetch the user by ID
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.username = username;
        await user.save();

        res.status(200).json({ message: "Username updated successfully", username: user.username });
    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

  

// Follow a user
const followUser = async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;
        console.log('Follow: Attempting to follow user', { userId, targetUserId });

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            console.log('Follow: User not found', { user, targetUser });
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        if (user.following.includes(targetUserId)) {
            console.log('Follow: Already following user');
            return res.status(400).json({ message: "Already following this user" });
        }

        // Add to following/followers
        user.following.push(targetUserId);
        targetUser.followers.push(userId);
        
        await Promise.all([user.save(), targetUser.save()]);
        console.log('Follow: Updated following/followers');

        // Create notification for the target user
        const notification = new Notification({
            recipient: targetUserId,
            sender: userId,
            type: 'follow',
            content: `${user.username || user.email} started following you`
        });

        const savedNotification = await notification.save();
        console.log('Follow: Created notification', savedNotification);

        // Get io instance and emit notification
        const io = req.app.get('io');
        if (!io) {
            console.error('Socket.io instance not found');
            // Continue execution even if socket.io is not available
        } else {
            try {
                const populatedNotification = await Notification.findById(savedNotification._id)
                    .populate('sender', 'username email profileImage');
                
                console.log('Follow: Populated notification', populatedNotification);

                // Get unread count
                const unreadCount = await Notification.countDocuments({
                    recipient: targetUserId,
                    read: false
                });
                console.log('Follow: Unread count', unreadCount);

                // Emit to specific user's room
                io.to(targetUserId.toString()).emit('newNotification', {
                    notification: populatedNotification,
                    count: unreadCount
                });
                console.log('Follow: Emitted notification to room', targetUserId.toString());
            } catch (error) {
                console.error('Error emitting notification:', error);
            }
        }

        // Return updated user data
        const updatedUser = await User.findById(userId)
            .select('following followers')
            .lean();

        res.json({ 
            message: "User followed successfully",
            following: updatedUser.following,
            followers: updatedUser.followers
        });
    } catch (error) {
        console.error("Error in followUser:", error);
        res.status(500).json({ message: "Error following user" });
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

        // Remove from following/followers using toString() for proper comparison
        user.following = user.following.filter(id => id.toString() !== targetUserId.toString());
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId.toString());

        await Promise.all([user.save(), targetUser.save()]);

        // Return updated user data
        const updatedUser = await User.findById(userId)
            .select('following followers')
            .lean();

        res.json({ 
            message: "User unfollowed successfully",
            following: updatedUser.following,
            followers: updatedUser.followers
        });
    } catch (error) {
        console.error("Error in unfollowUser:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
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

// Get user's followers with follow status
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching followers for user:', userId);
        
        const user = await User.findById(userId)
            .populate({
                path: 'followers',
                select: '_id username email profileImage following followers',
                populate: {
                    path: 'following followers',
                    select: '_id'
                }
            })
            .lean();
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transform the data to include follow status
        const followersWithStatus = user.followers.map(follower => ({
            ...follower,
            isFollowing: follower.following.some(id => id.toString() === userId),
            isFollowedByViewer: follower.followers.some(id => id.toString() === userId)
        }));

        console.log('Processed followers:', followersWithStatus);
        res.status(200).json(followersWithStatus);
    } catch (error) {
        console.error("Error getting followers:", error);
        res.status(500).json({ message: "Error getting followers", error: error.message });
    }
};

// Get user's following with follow status
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching following for user:', userId);
        
        const user = await User.findById(userId)
            .populate({
                path: 'following',
                select: '_id username email profileImage following followers',
                populate: {
                    path: 'following followers',
                    select: '_id'
                }
            })
            .lean();
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transform the data to include follow status
        const followingWithStatus = user.following.map(followedUser => ({
            ...followedUser,
            isFollowing: true, // Since these are users that the main user follows
            isFollowedByViewer: followedUser.followers.some(id => id.toString() === userId)
        }));

        console.log('Processed following:', followingWithStatus);
        res.status(200).json(followingWithStatus);
    } catch (error) {
        console.error("Error getting following:", error);
        res.status(500).json({ message: "Error getting following", error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        // Clear any session cookies
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

        // Clear session cookie
        res.clearCookie('token');
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

// Get user suggestions (users that the current user doesn't follow)
const getSuggestions = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log("Getting suggestions for user:", userId);

        if (!userId) {
            console.log("No userId provided in query");
            return res.status(400).json({ message: "User ID is required" });
        }

        // Get current user
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            console.log("User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Found current user:", currentUser.email);
        console.log("Current user following:", currentUser.following);

        // Get users that the current user is not following
        const suggestions = await User.find({
            _id: { 
                $ne: userId, // Exclude current user
                $nin: currentUser.following || [] // Exclude users being followed
            }
        })
        .select('username email profileImage jobTitle company')
        .sort({ createdAt: -1 }) // Show newest users first
        .limit(4); // Limit to 4 suggestions

        console.log("Found suggestions:", suggestions.length);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Error in getSuggestions:", error);
        res.status(500).json({ 
            message: "Error getting suggestions", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = { 
    updateUsername, 
    followUser, 
    unfollowUser, 
    getUserProfile, 
    getUser, 
    getFollowers, 
    getFollowing,
    logout,
    deleteAccount,
    getSuggestions
};




