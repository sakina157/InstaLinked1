import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { FaTimes } from 'react-icons/fa';

const Notification = ({ show, onClose }) => {
    const navigate = useNavigate();
    const { notifications, setNotifications, setUnreadCount } = useSocket();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchNotifications();
        }
    }, [show]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                console.log('No user found in localStorage');
                return;
            }

            console.log('Fetching notifications for user:', user._id);
            const response = await fetch(`http://localhost:5500/api/notifications/user/${user._id}`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Notifications response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching notifications:', errorData);
                return;
            }

            const data = await response.json();
            console.log('Fetched notifications:', data);
            setNotifications(data);
            
            // Reset unread count when notifications are viewed
            setUnreadCount(0);
            
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowBack = async (senderId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch('http://localhost:5500/api/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: user._id,
                    targetUserId: senderId
                })
            });

            if (response.ok) {
                // Update the notifications list to show "Following" instead of "Follow Back"
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.sender._id === senderId 
                            ? { ...notif, isFollowingBack: true }
                            : notif
                    )
                );
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:5500/api/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        try {
            await fetch(`http://localhost:5500/api/notifications/${notification._id}/read`, {
                method: 'PUT',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }

        // Navigate to sender's profile
        navigate(`/profile/${notification.sender._id}`);
        onClose();
    };

    if (!show) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>Notifications</h3>
                    <button style={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div style={styles.content}>
                    {loading ? (
                        <div style={styles.loading}>Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div style={styles.empty}>No notifications yet</div>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification._id} style={styles.notificationItem}>
                                <div 
                                    style={styles.notificationContent}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <img 
                                        src={notification.sender.profileImage || "/default-avatar.png"} 
                                        alt="" 
                                        style={styles.avatar}
                                    />
                                    <div style={styles.notificationText}>
                                        <span style={styles.username}>{notification.sender.username}</span>
                                        <span>{notification.content}</span>
                                        <span style={styles.time}>
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div style={styles.actions}>
                                    {notification.type === 'follow' && !notification.isFollowingBack && (
                                        <button 
                                            style={styles.followButton}
                                            onClick={() => handleFollowBack(notification.sender._id)}
                                        >
                                            Follow Back
                                        </button>
                                    )}
                                    <button 
                                        style={styles.deleteButton}
                                        onClick={() => handleDeleteNotification(notification._id)}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '60px',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        padding: '16px',
        borderBottom: '1px solid #dbdbdb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px'
    },
    content: {
        overflowY: 'auto',
        padding: '8px 0'
    },
    notificationItem: {
        padding: '12px 16px',
        borderBottom: '1px solid #efefef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    notificationContent: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        cursor: 'pointer'
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        marginRight: '12px'
    },
    notificationText: {
        display: 'flex',
        flexDirection: 'column'
    },
    username: {
        fontWeight: 'bold',
        marginBottom: '4px'
    },
    time: {
        fontSize: '12px',
        color: '#8e8e8e',
        marginTop: '4px'
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    followButton: {
        backgroundColor: '#006d77',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    deleteButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#8e8e8e',
        padding: '4px'
    },
    loading: {
        padding: '20px',
        textAlign: 'center',
        color: '#8e8e8e'
    },
    empty: {
        padding: '20px',
        textAlign: 'center',
        color: '#8e8e8e'
    }
};

export default Notification; 