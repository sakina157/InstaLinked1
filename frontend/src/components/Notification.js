import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


const Notification = () => {

    const { notifications, setNotifications, setUnreadCount } = useSocket();
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/home'); // Navigate to the home page
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

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
            const response = await fetch(`http://localhost:5500/api/follow/${senderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            body: JSON.stringify({
                followerId: user._id, // Change this to send followerId
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
        
    };
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    const getNotificationsByDate = (notifications, daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return notifications.filter(notif => {
            const notificationDate = new Date(notif.createdAt);
            return notificationDate.toDateString() === date.toDateString();
        });
    };

    const getPreviousNotifications = (notifications) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return notifications.filter(notif => {
            const notificationDate = new Date(notif.createdAt);
            return notificationDate.toDateString() !== today.toDateString() && notificationDate.toDateString() !== yesterday.toDateString();
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                    <h3 style={styles.headerTitle}>Notifications</h3>
                    <button 
                    style={styles.closeButton}
                    onClick={handleClose}
                >
                    <FaTimes />
                </button>
                    </div>
                    <div style={styles.toolbox}>
                    <button 
                    style={activeFilter === 'All' ? styles.activeToolboxButton : styles.toolboxButton}
                    onClick={() => handleFilterClick('All')}
                >
                    All
                </button>    
                <button 
                    style={activeFilter === 'Mentions' ? styles.activeToolboxButton : styles.toolboxButton}
                    onClick={() => handleFilterClick('Mentions')}
                >
                    Mentions
                </button>
                <button 
                    style={activeFilter === 'Comments' ? styles.activeToolboxButton : styles.toolboxButton}
                    onClick={() => handleFilterClick('Comments')}
                >
                    Comments
                </button>
                <button 
                    style={activeFilter === 'Likes' ? styles.activeToolboxButton : styles.toolboxButton}
                    onClick={() => handleFilterClick('Likes')}
                >
                    Likes
                </button>
                <button 
                    style={activeFilter === 'Follows' ? styles.activeToolboxButton : styles.toolboxButton}
                    onClick={() => handleFilterClick('Follows')}
                >
                    Follows
                </button>
                </div>
                
                    {loading ? (
                        <div style={styles.loading}>Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div style={styles.empty}>No notifications yet</div>
                    ) : (
                        <div style={styles.notificationsContainer}>
                    {getNotificationsByDate(notifications, 0).length > 0 && (
    <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Today</h4>
        {getNotificationsByDate(notifications, 0).map(notification => (
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
                            {new Date(notification.createdAt).toLocaleTimeString()}
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
        ))}
    </div>
)}
                    {getNotificationsByDate(notifications, 1).length > 0 && (
                        <div style={styles.section}>
                            <h4 style={styles.sectionTitle}>Yesterday</h4>
                            {getNotificationsByDate(notifications, 1).map(notification => (
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
                                                {new Date(notification.createdAt).toLocaleTimeString()}
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
                            ))}
                        </div>
                    )}

                    {getPreviousNotifications(notifications).length > 0 && (
                        <div style={styles.section}>
                            <h4 style={styles.sectionTitle}>Previous</h4>
                            {getPreviousNotifications(notifications).map(notification => (
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
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '500px',
        margin: '0 auto',
        padding: '15px',
        backgroundColor: '#f4f2ee',
        minHeight: '100vh',
    },
    header: {
        backgroundColor: '#006d77',
        color: '#ffffff',
        padding: '16px',
        alignItems: 'center',
        marginBottom: '20px',
        borderRadius: '8px 8px 0 0',
    },
    headerTitle: {
        margin: 0,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#ffffff', 
        fontSize: '20px', // Adjust size as needed
        padding: '0',
        display: 'flex',
        alignItems: 'center',
    },
    toolbox: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px',
        borderRadius: '0 0 8px 8px',
        marginBottom: '20px',
    },
    toolboxButton: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: '#000000',
        border: '1px solid #006d77',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    activeToolboxButton: {
        padding: '8px 16px',
        backgroundColor: '#80b6bb',
        color: '#ffffff',
        border: '1px solid #80b6bb',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    notificationsContainer: {
        borderRadius: '8px',
        padding: '16px',
    },
    notificationItem: {
        padding: '10px 10px',
        borderBottom: '1px solid #efefef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginBottom: '10px',
    },
    notificationContent: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        cursor: 'pointer',
    },
    section: {
        marginBottom: '20px',
    },
    sectionTitle: {
        marginBottom: '16px',
        color: '#000000',
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
        gap: '8px',
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
