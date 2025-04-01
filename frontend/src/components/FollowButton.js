import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FollowButton = ({ targetUserId, onFollowChange }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [showUnfollow, setShowUnfollow] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    useEffect(() => {
        // Get logged-in user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setLoggedInUserId(user._id);
        }
    }, []);

    useEffect(() => {
        // Check initial follow status
        const checkFollowStatus = async () => {
            if (!loggedInUserId) return;
            
            try {
                const response = await axios.get(`http://localhost:5500/api/follow/status/${targetUserId}?followerId=${loggedInUserId}`, {
                    withCredentials: true
                });
                setIsFollowing(response.data.isFollowing);
            } catch (error) {
                console.error('Error checking follow status:', error);
                console.log('Target User ID:', targetUserId, 'Logged In User ID:', loggedInUserId);
            }
        };

        checkFollowStatus();
    }, [targetUserId, loggedInUserId]);

    const handleFollow = async () => {
        if (!loggedInUserId) return;

        try {
            await axios.post(`http://localhost:5500/api/follow/${targetUserId}`, {
                followerId: loggedInUserId
            }, {
                withCredentials: true
            });
            setIsFollowing(true);
            if (onFollowChange) onFollowChange(true);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async () => {
        if (!loggedInUserId) return;

        try {
            await axios.delete(`http://localhost:5500/api/follow/${targetUserId}`, {
                data: { followerId: loggedInUserId },
                withCredentials: true
            });
            setIsFollowing(false);
            setShowUnfollow(false);
            if (onFollowChange) onFollowChange(false);
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const buttonStyle = {
        padding: '10px 15px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        ...(!isFollowing ? {
            backgroundColor: '#006d77',
            color: '#fff',
        } : {
            backgroundColor: '#f4f4f4',
            color: '#333',
            border: '1px solid #ddd'
        })
    };

    const unfollowStyle = {
        ...buttonStyle,
        backgroundColor: '#ff3b30',
        color: '#fff'
    };

    if (isFollowing) {
        return (
            <button
                style={showUnfollow ? unfollowStyle : buttonStyle}
                onMouseEnter={() => setShowUnfollow(true)}
                onMouseLeave={() => setShowUnfollow(false)}
                onClick={handleUnfollow}
            >
                {showUnfollow ? 'Unfollow' : 'Following'}
            </button>
        );
    }

    return (
        <button style={buttonStyle} onClick={handleFollow}>
            Follow
        </button>
    );
};

export default FollowButton;
