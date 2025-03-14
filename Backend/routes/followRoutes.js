const express = require('express');
const router = express.Router();
const { followUser, unfollowUser, getFollowStatus } = require('../controllers/followController');

// Follow a user
router.post('/:userId', followUser);

// Unfollow a user
router.delete('/:userId', unfollowUser);

// Get follow status
router.get('/status/:userId', getFollowStatus);

module.exports = router; 