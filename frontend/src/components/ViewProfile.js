import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShareAlt, FaTimes, FaHeart, FaRegComment } from "react-icons/fa";
import HomeNavbar from './HomeNavbar';
import FollowButton from './FollowButton';
import disk from '../images/disk.jpg';
import axios from 'axios';
import default_user from '../images/default_user.jpg';
import PostPopup from './PostPopup';

const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Get logged in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the stored user to check if this is the logged-in user's profile
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        // If userId matches stored user's email or ID, use stored user data
        const isLoggedInUser = storedUser.email === userId || storedUser._id === userId;
        
        let userResponse;
        if (isLoggedInUser) {
          // If it's the logged-in user, get fresh data
          userResponse = await axios.get(`http://localhost:5500/api/user/data`, {
            params: { email: storedUser.email }
          });
        } else {
          // Try to get user data by email first
          try {
            userResponse = await axios.get(`http://localhost:5500/api/user/data`, {
              params: { email: userId }
            });
          } catch (err) {
            // If email lookup fails, try by ID
            userResponse = await axios.get(`http://localhost:5500/api/user/${userId}`);
          }
        }
        
        if (!userResponse.data) {
          throw new Error('User not found');
        }

        // Get user's posts using their email
        const postsResponse = await axios.get('http://localhost:5500/api/feed/homepage', {
          params: { email: userResponse.data.email }
        });
        
        // Set user data with their posts
        const userData = {
          ...userResponse.data,
          posts: postsResponse.data || [],
          isCurrentUser: isLoggedInUser
        };

        setUser(userData);
        
        // If this is the logged-in user, update localStorage
        if (isLoggedInUser) {
          localStorage.setItem("user", JSON.stringify({
            ...storedUser,
            ...userResponse.data
          }));
        }

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Fetch followers/following lists
  const fetchFollowersList = async () => {
    try {
      setLoadingFollowers(true);
      console.log('Fetching followers for userId:', userId);
      const response = await fetch(`http://localhost:5500/api/users/${userId}/followers`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch followers: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Followers response:', data);
      
      // Make sure we're getting an array of user objects
      if (Array.isArray(data)) {
        // If the data is just an array of IDs, we need to fetch user details
        if (data.length > 0 && typeof data[0] === 'string') {
          const userDetails = await Promise.all(
            data.map(async (followerId) => {
              const userResponse = await fetch(`http://localhost:5500/api/user/${followerId}`, {
                credentials: 'include',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });
              if (!userResponse.ok) throw new Error(`Failed to fetch user ${followerId}`);
              return userResponse.json();
            })
          );
          setFollowersList(userDetails);
        } else {
          setFollowersList(data);
        }
      } else {
        console.error('Followers data is not an array:', data);
        setFollowersList([]);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowersList([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowingList = async () => {
    try {
      setLoadingFollowing(true);
      console.log('Fetching following for userId:', userId);
      const response = await fetch(`http://localhost:5500/api/users/${userId}/following`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch following: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Following response:', data);
      setFollowingList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Update handleFollowAction
  const handleFollowAction = async (targetUserId, isCurrentlyFollowing) => {
    try {
        console.log('Attempting to follow/unfollow:', {
            loggedInUser: loggedInUser._id,
            targetUserId,
            isCurrentlyFollowing
        });

        const response = await fetch(`http://localhost:5500/api/users/${isCurrentlyFollowing ? 'unfollow' : 'follow'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                userId: loggedInUser._id,
                targetUserId
            })
        });

        console.log('Follow/unfollow response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Follow/unfollow error:', errorData);
            throw new Error(`Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user`);
        }

        const data = await response.json();
        console.log('Follow/unfollow success:', data);

        // Update logged-in user state with new following/followers lists
        setLoggedInUser(prev => ({
            ...prev,
            following: data.following,
            followers: data.followers
        }));

        // Update viewed user's followers/following if we're on their profile
        if (userId === targetUserId) {
            setUser(prev => ({
                ...prev,
                followers: isCurrentlyFollowing
                    ? prev.followers.filter(id => id !== loggedInUser._id)
                    : [...prev.followers, loggedInUser._id]
            }));
        }

        // Refresh the lists immediately
        if (showFollowers) {
            console.log('Refreshing followers list');
            await fetchFollowersList();
        }
        if (showFollowing) {
            console.log('Refreshing following list');
            await fetchFollowingList();
        }

    } catch (error) {
        console.error(`Error ${isCurrentlyFollowing ? 'unfollowing' : 'following'} user:`, error);
    }
  };

  // Update UserListModal component
  const UserListModal = ({ show, onClose, title, users, loading }) => {
    if (!show) return null;

    const getFollowButtonText = (listUser) => {
        if (!loggedInUser || loggedInUser._id === listUser._id) return null;
        
        // Check if the logged-in user is following this user
        const isFollowing = loggedInUser.following?.some(id => id.toString() === listUser._id.toString());
        // Check if this user is following the logged-in user
        const isFollowedBy = listUser.followers?.some(id => id.toString() === loggedInUser._id.toString());
        
        if (isFollowing) return "Following";
        if (isFollowedBy) return "Follow Back";
        return "Follow";
    };

    const getButtonStyle = (listUser) => {
        const isFollowing = loggedInUser?.following?.some(id => id.toString() === listUser._id.toString());
        return {
            ...styles.followButton,
            backgroundColor: isFollowing ? '#e0e0e0' : '#006d77',
            color: isFollowing ? '#000' : '#fff'
        };
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button style={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div style={styles.userList}>
                    {loading ? (
                        <div style={styles.loadingText}>Loading...</div>
                    ) : users.length === 0 ? (
                        <div style={styles.emptyText}>No {title.toLowerCase()} yet</div>
                    ) : (
                        users.map(listUser => (
                            <div key={listUser._id} style={styles.userListItem}>
                                <div 
                                    style={{
                                        ...styles.userListLeft,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        navigate(`/profile/${listUser._id}`);
                                        onClose();
                                    }}
                                >
                                    <div style={styles.userListAvatarContainer}>
                                        <img 
                                            src={listUser.profileImage || "/default-avatar.png"} 
                                            alt={listUser.username || listUser.email} 
                                            style={styles.userListAvatar}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/default-avatar.png";
                                            }}
                                        />
                                    </div>
                                    <div style={styles.userListInfo}>
                                        <span style={styles.userListName}>{listUser.username || listUser.email}</span>
                                    </div>
                                </div>
                                {loggedInUser && loggedInUser._id !== listUser._id && (
                                    <button 
                                        style={getButtonStyle(listUser)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const isFollowing = loggedInUser?.following?.some(
                                                id => id.toString() === listUser._id.toString()
                                            );
                                            handleFollowAction(listUser._id, isFollowing);
                                        }}
                                    >
                                        {getFollowButtonText(listUser)}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderPostPreview = useCallback((post) => {
    switch (post.content_type?.toLowerCase()) {
      case 'image':
        return (
          <div 
            key={post._id}
            style={styles.postCard}
            onClick={() => setSelectedPost({
              ...post,
              user: {
                profileImage: user?.profileImage,
                username: user?.username,
                email: user?.email
              }
            })}
          >
            <img 
              src={post.url} 
              alt={post.caption} 
              style={styles.postPreviewImage}
            />
          </div>
        );
      case 'video':
        return (
          <div 
            key={post._id}
            style={styles.postCard}
            onClick={() => setSelectedPost({
              ...post,
              user: {
                profileImage: user?.profileImage,
                username: user?.username,
                email: user?.email
              }
            })}
          >
            <div style={styles.postPreviewVideo}>
              <video src={post.url} style={styles.postPreviewImage} />
              <div style={styles.playIcon}>▶️</div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div 
            key={post._id}
            style={styles.postCard}
            onClick={() => setSelectedPost({
              ...post,
              user: {
                profileImage: user?.profileImage,
                username: user?.username,
                email: user?.email
              }
            })}
          >
            <div style={styles.postPreviewAudio}>
              <img src={disk} alt="Audio thumbnail" style={styles.postPreviewImage} />
              <div style={styles.audioIcon}>🎵</div>
            </div>
          </div>
        );
      default:
        return (
          <div 
            key={post._id}
            style={styles.postCard}
            onClick={() => setSelectedPost({
              ...post,
              user: {
                profileImage: user?.profileImage,
                username: user?.username,
                email: user?.email
              }
            })}
          >
            <div style={styles.postPreviewDefault}>
              <span>📄 {post.content_type}</span>
            </div>
          </div>
        );
    }
  }, [user]);

  if (loading) {
    return (
      <>
        <HomeNavbar />
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading profile...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HomeNavbar />
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          {error}
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <HomeNavbar />
        <div style={{ textAlign: 'center', padding: '20px' }}>
          User not found
        </div>
      </>
    );
  }

  return (
    <>
    <HomeNavbar /> 
    <div style={styles.container}>
      {/* Left Section */}
      <div style={styles.leftSection}>
        {/* Profile Section */}
        <div style={styles.profileCard}>
          <img
            src={user?.profileImage || default_user}
            alt="Profile"
            style={styles.profileImage}
          />
          <div style={styles.userInfo}>
            <h2 style={styles.name}>{user?.username || user?.email || "No Name Available"}</h2>
            <p style={styles.username}>@{user?.username || "N/A"}</p>
            <p style={styles.job}>{user?.jobTitle || "No Job"} at {user?.company || "Unknown Company"}</p>
            <p style={styles.location}>{user?.location || "Location Unavailable"}</p>
            <div style={styles.stats}>
                <span>{user?.posts?.length || 0} Posts</span>
                <span 
                  style={styles.clickableStat} 
                  onClick={() => {
                    fetchFollowersList();
                    setShowFollowers(true);
                  }}
                >
                  {user?.followers?.length || 0} Followers
                </span>
                <span 
                  style={styles.clickableStat}
                  onClick={() => {
                    fetchFollowingList();
                    setShowFollowing(true);
                  }}
                >
                  {user?.following?.length || 0} Following
                </span>
            </div>
            <div style={styles.buttons}>
                {user?.isCurrentUser ? (
                <button style={styles.editButton} onClick={() => navigate("/create-profile")}>
                  Edit Profile
                </button>
                ) : (
                  <>
                    <FollowButton 
                      targetUserId={user?._id} 
                      onFollowChange={(isFollowing) => {
                        setUser(prev => ({
                          ...prev,
                          followers: isFollowing 
                            ? [...(prev.followers || []), loggedInUser._id]
                            : (prev.followers || []).filter(id => id !== loggedInUser._id)
                        }));
                      }}
                    />
                    <button style={styles.messageButton}>Message</button>
                  </>
              )}
              <button style={styles.shareButton}>
                <FaShareAlt /> Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div style={styles.section}>
          <h3>About</h3>
          <p>{user.about || "No about info available."}</p>
        </div>

        {/* ANALYTICS SECTION  */}
        <div style={styles.analyticsSection}>
          <h3>Analytics</h3>
          <div style={styles.analyticsBox}>

          </div>
        </div>

        {/* Posts Section */}
        <div style={styles.section}>
          <h3>Posts</h3>
          <div style={styles.postGrid}>
            {Array.isArray(user?.posts) && user.posts.length > 0 ? (
              user.posts.map((post) => renderPostPreview(post))
            ) : (
              <p>No posts available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        {/* Recent Activity */}
        <div style={styles.activitySection}>
          <h3>Recent Activity</h3>
          <div style={styles.activityBox}>
            <p>John Doe liked your post</p>
            <span>2 hours ago</span>
          </div>
          <div style={styles.activityBox}>
            <p>Jane Smith commented on your post</p>
            <span>5 hours ago</span>
          </div>
        </div>

        {/* Suggested for You */}
        <div style={styles.suggestionSection}>
          <h3>Suggested for you</h3>
          <div style={styles.suggestionBox}>
            <p>Alex Turner</p>
            <span>Product Manager at Tech Co</span>
            <button style={styles.followButton}>Follow</button>
          </div>
          <div style={styles.suggestionBox}>
            <p>Emily Chen</p>
            <span>UI Designer at Design Studio</span>
            <button style={styles.followButton}>Follow</button>
          </div>
        </div>
      </div>
    </div>

      {/* Modals */}
      <UserListModal 
        show={showFollowers} 
        onClose={() => setShowFollowers(false)} 
        title="Followers" 
        users={followersList}
        loading={loadingFollowers}
      />
      <UserListModal 
        show={showFollowing} 
        onClose={() => setShowFollowing(false)} 
        title="Following" 
        users={followingList}
        loading={loadingFollowing}
      />

      {/* Post Popup */}
      {selectedPost && (
        <PostPopup
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isCurrentUser={selectedPost.user_email === loggedInUser?.email}
        />
      )}

      <style jsx>{`
        .post-preview:hover .post-hover-overlay {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

// Update styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f2ee",
    color: "#000",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: "20px",
  },
  leftSection: {
    width: "65%",
    marginRight: "20px",
  },
  rightSection: {
    width: "30%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  profileCard: {
    display: "flex",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    margin: "20px 0",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },
  profileImage: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    marginRight: "30px",
    objectFit: "cover"
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: "22px",
    fontWeight: "bold",
  },
  username: {
    color: "#80b6bb",
    fontSize: "16px",
  },
  job: {
    fontSize: "14px",
    color: "#666",
    marginTop: "5px",
  },
  location: {
    fontSize: "14px",
    color: "#666",
    marginTop: "5px",
  },
  analyticsSection: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
    marginTop: "20px",
  },
  analyticsBox: {
    display: "flex",
    justifyContent: "space-around",
    padding: "15px",
    borderBottom: "1px solid #ddd",
  },
  activitySection: {
    backgroundColor: "#f0f0f5",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  activityBox: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "12px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
  },
  suggestionSection: {
    backgroundColor: "#f0f0f5",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  suggestionBox: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "12px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    gap: "20px",
  },
  followButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px',
    textAlign: 'center',
    backgroundColor: '#006d77',
    color: '#fff',
    marginLeft: '8px',
    '&:hover': {
      opacity: 0.9,
    },
  },
  messageButton: {
    backgroundColor: "#80b6bb",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  stats: {
    display: "flex",
    gap: "18px",
    marginTop: "12px",
  },
  buttons: {
    marginTop: "12px",
    display: "flex",
    gap: "12px",
  },
  editButton: {
    backgroundColor: "#006d77",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "6px",
  },
  shareButton: {
    backgroundColor: "#80b6bb",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "6px",
  },
  section: {
    backgroundColor: "#fff",
    padding: "22px",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
  },
  postGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginTop: '15px',
  },
  postCard: {
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  postPreviewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  postPreviewVideo: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: '8px',
  },
  postPreviewAudio: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postPreviewDefault: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '32px',
    color: 'white',
  },
  audioIcon: {
    position: 'absolute',
    fontSize: '32px',
  },
  clickableStat: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '400px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
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
    fontSize: '20px'
  },
  userList: {
    overflowY: 'auto',
    padding: '8px 0'
  },
  userListItem: {
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#fafafa'
    }
  },
  userListLeft: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    marginRight: '12px'
  },
  userListAvatarContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginRight: '12px',
    flexShrink: 0,
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #dbdbdb'
  },
  userListAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  userListInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userListName: {
    fontWeight: '600',
    fontSize: '14px'
  },
  loadingText: {
    padding: '20px',
    textAlign: 'center',
    color: '#8e8e8e'
  },
  emptyText: {
    padding: '20px',
    textAlign: 'center',
    color: '#8e8e8e'
  },
  loadingSpinner: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '16px'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#ff4444',
    fontSize: '16px'
  }
};

export default ViewProfile;