const express = require('express');
const router = express.Router();
const {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
    getUnreadCount
} = require('../controllers/notificationController');

// Create a new notification
router.post('/', createNotification);

// Get user's notifications
router.get('/user/:userId', getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Get unread notification count
router.get('/unread/:userId', getUnreadCount);

module.exports = router; 