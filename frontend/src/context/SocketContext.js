import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('SocketContext: User from localStorage:', user);
        
        if (user) {
            console.log('SocketContext: Creating socket connection...');
            // Create socket connection
            const newSocket = io('http://localhost:5500', {
                withCredentials: true,
                transports: ['websocket']
            });

            // Socket connection event handlers
            newSocket.on('connect', () => {
                console.log('SocketContext: Socket connected successfully');
                // Join user's room for notifications
                newSocket.emit('join', user._id.toString());
                console.log('SocketContext: Joined room:', user._id.toString());
            });

            newSocket.on('connect_error', (error) => {
                console.error('SocketContext: Socket connection error:', error);
            });

            // Listen for new notifications
            newSocket.on('newNotification', (data) => {
                console.log('SocketContext: Received new notification:', data);
                if (data.notification) {
                    setNotifications(prev => {
                        // Check if notification already exists
                        const exists = prev.some(n => n._id === data.notification._id);
                        if (!exists) {
                            return [data.notification, ...prev];
                        }
                        return prev;
                    });
                    
                    // Update unread count
                    if (data.count !== undefined) {
                        setUnreadCount(data.count);
                    } else {
                        // If count not provided, increment by 1
                        setUnreadCount(prev => prev + 1);
                    }
                }
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                console.log('SocketContext: Cleaning up socket connection');
                if (newSocket) {
                    newSocket.disconnect();
                }
            };
        }
    }, []); // Only run once on mount

    const value = {
        socket,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}; 