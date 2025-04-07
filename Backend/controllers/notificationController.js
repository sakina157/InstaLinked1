const Notification = require('../models/notification');
const User = require('../models/user');

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { recipientId, senderId, type, content, postId, postImage } = req.body;

        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            content,
            postId,
            postImage
        });

        await notification.save();

        // Populate sender details for immediate use
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'username profileImage');

        // Get io instance
        const io = req.app.get('io');
        
        // Emit to specific user's room
        io.to(recipientId).emit('newNotification', {
            notification: populatedNotification,
            count: await Notification.countDocuments({
                recipient: recipientId,
                read: false
            })
        });

        res.status(201).json(populatedNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Error creating notification', error: error.message });
    }
};

// Get user's notifications
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'username profileImage')
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;

        const count = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        res.status(200).json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Error getting unread count', error: error.message });
    }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        // Update all unread notifications for this user
        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
    getUnreadCount,
    markAllAsRead
}; 