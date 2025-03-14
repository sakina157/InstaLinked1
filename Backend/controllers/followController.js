const User = require('../models/user');

// Handle follow user
const followUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to follow
        const followerId = req.body.followerId; // Get follower ID from request body

        // Check if users exist
        const [userToFollow, follower] = await Promise.all([
            User.findById(userId),
            User.findById(followerId)
        ]);

        if (!userToFollow || !follower) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        if (userToFollow.followers.includes(followerId)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        // Add follower to user's followers array
        await User.findByIdAndUpdate(userId, {
            $push: { followers: followerId }
        });

        // Add to following array of the follower
        await User.findByIdAndUpdate(followerId, {
            $push: { following: userId }
        });

        res.status(200).json({ message: "Successfully followed user" });
    } catch (error) {
        console.error("Error in followUser:", error);
        res.status(500).json({ message: "Error following user", error: error.message });
    }
};

// Handle unfollow user
const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to unfollow
        const followerId = req.body.followerId; // Get follower ID from request body

        // Check if users exist
        const [userToUnfollow, follower] = await Promise.all([
            User.findById(userId),
            User.findById(followerId)
        ]);

        if (!userToUnfollow || !follower) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if actually following
        if (!userToUnfollow.followers.includes(followerId)) {
            return res.status(400).json({ message: "Not following this user" });
        }

        // Remove follower from user's followers array
        await User.findByIdAndUpdate(userId, {
            $pull: { followers: followerId }
        });

        // Remove from following array of the follower
        await User.findByIdAndUpdate(followerId, {
            $pull: { following: userId }
        });

        res.status(200).json({ message: "Successfully unfollowed user" });
    } catch (error) {
        console.error("Error in unfollowUser:", error);
        res.status(500).json({ message: "Error unfollowing user", error: error.message });
    }
};

// Get follow status
const getFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.query.followerId; // Get follower ID from query params

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = user.followers.includes(followerId);
        res.status(200).json({ isFollowing });
    } catch (error) {
        console.error("Error in getFollowStatus:", error);
        res.status(500).json({ message: "Error getting follow status", error: error.message });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowStatus
}; 