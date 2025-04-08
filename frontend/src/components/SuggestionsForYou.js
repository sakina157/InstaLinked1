import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FollowButton from './FollowButton';
import default_user from '../images/default_user.jpg';

const SuggestionsForYou = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                if (!loggedInUser._id) {
                    console.log("No user ID found");
                    setLoading(false);
                    return;
                }

                console.log("Fetching suggestions for user:", loggedInUser._id);
                const response = await axios.get(`http://localhost:5500/api/users/suggestions`, {
                    params: { userId: loggedInUser._id }
                });

                console.log("Suggestions response:", response.data);
                if (Array.isArray(response.data)) {
                    setSuggestions(response.data.slice(0, 4));
                } else {
                    console.error("Invalid response format:", response.data);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [loggedInUser._id]);

    const handleUsernameClick = (userEmail) => {
        navigate(`/profile/${userEmail}`);
    };

    const styles = {
        container: {
            backgroundColor: '#f4f2ee',
            borderRadius: '4px',
            marginTop: '24px',
            width: '100%',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        },
        headerContainer: {
            backgroundColor: '#80b6bb',
            padding: '12px 15px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
        },
        header: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#000000',
            margin: 0,
        },
        content: {
            padding: '12px 15px',
            backgroundColor: '#f4f2ee',
        },
        suggestionItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            backgroundColor: 'transparent',
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            marginRight: '12px',
        },
        avatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            marginRight: '12px',
            objectFit: 'cover',
        },
        userDetails: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        username: {
            fontWeight: '600',
            color: '#000000',
            cursor: 'pointer',
            fontSize: '13px',
            marginBottom: '2px',
            '&:hover': {
                textDecoration: 'underline',
            },
        },
        userTitle: {
            color: '#666666',
            fontSize: '12px',
        },
        followButtonContainer: {
            minWidth: '70px',
            display: 'flex',
            justifyContent: 'flex-end',
        },
        loadingText: {
            color: '#666666',
            textAlign: 'center',
            padding: '12px 15px',
            fontSize: '13px',
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.headerContainer}>
                    <h3 style={styles.header}>Suggested for you</h3>
                </div>
                <div style={styles.content}>
                    <div style={styles.loadingText}>Loading suggestions...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <h3 style={styles.header}>Suggested for you</h3>
            </div>
            <div style={styles.content}>
                {suggestions.map((user) => (
                    <div key={user._id} style={styles.suggestionItem}>
                        <div style={styles.userInfo}>
                            <img
                                src={user.profileImage || default_user}
                                alt={user.username}
                                style={styles.avatar}
                                onClick={() => handleUsernameClick(user.email)}
                            />
                            <div style={styles.userDetails}>
                                <span
                                    style={styles.username}
                                    onClick={() => handleUsernameClick(user.email)}
                                >
                                    {user.username || user.email}
                                </span>
                                <span style={styles.userTitle}>
                                    {user.jobTitle || 'Product Designer'}
                                </span>
                            </div>
                        </div>
                        <div style={styles.followButtonContainer}>
                            <FollowButton
                                targetUserId={user._id}
                                onFollowChange={(isFollowing) => {
                                    if (isFollowing) {
                                        setSuggestions(prev => 
                                            prev.filter(suggestion => suggestion._id !== user._id)
                                        );
                                    }
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionsForYou; 