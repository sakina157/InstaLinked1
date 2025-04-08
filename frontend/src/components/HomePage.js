import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import default_user from '../images/default_user.jpg';
import HomeNavbar from "./HomeNavbar";
import disk from '../images/disk.jpg';
import { useRef } from "react";
import PostPopup from './PostPopup';
import { FaHeart, FaRegComment, FaRegHeart, FaFilm } from 'react-icons/fa';
import SuggestionsForYou from './SuggestionsForYou';

// Change the default profile image to use local image instead of Cloudinary
const DEFAULT_PROFILE_IMAGE = default_user;

const HomePage = () => {
  const storedUser = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);
  const navigate = useNavigate();
  const [username, setUsername] = useState(storedUser.username || "Loading...");
  const [profileImage, setProfileImage] = useState(storedUser.profileImage || DEFAULT_PROFILE_IMAGE);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const videoRefs = useRef({});
  const [page, setPage] = useState(1);
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const handleVideoPreview = useCallback((postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      video.play();
      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
      }, 5000); // Preview for 5 seconds
    }
  }, []);

  const mediaStyle = useMemo(() => ({
    width: '100%',
    maxWidth: '470px',
    height: 'auto',
    marginBottom: '20px',
    borderRadius: '8px',
    objectFit: 'cover'
  }), []);

  const fetchUserData = useCallback(async () => {
    if (!storedUser.email) {
      console.error("⚠️ No email found in LocalStorage! Cannot fetch user data.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5500/api/user/data", {
        params: { email: storedUser.email },
        withCredentials: true,
      });

      if (response.data) {
        const newUserData = {
          ...storedUser,
          username: response.data.username,
          profileImage: response.data.profileImage || DEFAULT_PROFILE_IMAGE
        };

        // Update state and localStorage in one go
        setUsername(newUserData.username);
        setProfileImage(newUserData.profileImage);
        localStorage.setItem("user", JSON.stringify(newUserData));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [storedUser]);

  // Fetch feed data
  const fetchHomepagePosts = useCallback(async () => {
    try {
      // If we're on a profile page, fetch only that user's posts
      const email = location.pathname.startsWith('/profile/') 
        ? location.pathname.split('/profile/')[1]
        : null;

      const response = await axios.get("http://localhost:5500/api/feed/homepage", {
        params: { email }
      });

      if (Array.isArray(response.data)) {
        setPosts(response.data);
        setFilteredPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching homepage posts:', error);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    // Always fetch fresh data when navigating or reloading
      localStorage.removeItem("homepagePosts");
      fetchHomepagePosts();
  }, [fetchHomepagePosts, location]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = posts.filter(post => post.category === selectedCategory);
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedCategory, posts]);

  const renderMedia = useCallback((post) => {
    const style = {
      width: '100%',
      maxWidth: '600px',
      maxHeight: '600px',
      objectFit: 'contain',
      borderRadius: '0',
      marginBottom: 0
    };

    switch (post.content_type?.toLowerCase()) {
      case 'image':
        return (
          <img
            src={post.url}
            alt={post.caption}
            style={style}
            loading="lazy"
          />
        );
      case 'video':
        return (
          <video
            src={post.url}
            style={style}
            controls
            autoPlay={post.autoPlay}
            muted={post.autoPlay}
            loop
            playsInline
            ref={el => videoRefs.current[post._id] = el}
            onMouseEnter={() => handleVideoPreview(post._id)}
          />
        );
      case 'reel':
        return (
          <video
            src={post.url}
            style={{...style, aspectRatio: '9/16'}}
            controls
            muted
            playsInline
            ref={el => videoRefs.current[post._id] = el}
            onMouseEnter={() => handleVideoPreview(post._id)}
          />
        );
      case 'documentary':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
              src={post.url}
              style={{...style, aspectRatio: '16/9'}}
              controls
              muted
              playsInline
              ref={el => videoRefs.current[post._id] = el}
              onMouseEnter={() => handleVideoPreview(post._id)}
            />
            <span style={{ position: 'absolute', top: 0, right: 0, color: 'white', zIndex: 10, pointerEvents: 'none' }}>
              <FaFilm size={30} style={{ position: 'absolute', color: 'white', top: 0, right: 0, padding: '5px', backgroundColor: "hsla(172, 96.40%, 43.50%, 0.53)" }} />
            </span>
          </div>
        );
      case 'audio':
        return (
          <div style={{ padding: '10px' }}>
            <img
              src={post.thumbnail || disk}
              alt="Audio thumbnail"
              style={{ ...style, height: '200px' }}
            />
            <audio
              src={post.url}
              controls
              style={{ width: '100%', marginTop: '10px' }}
            />
          </div>
        );
      case 'pdf':
        return (
          <div style={{ padding: '10px' }}>
            <img
              src={post.thumbnail || DEFAULT_PROFILE_IMAGE}
              alt="PDF thumbnail"
              style={{ ...style, height: '200px' }}
            />
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', marginTop: '10px', color: '#0095f6' }}
            >
              View PDF
            </a>
          </div>
        );
      default:
        return null;
    }
  }, [handleVideoPreview]);

  const handleUsernameClick = (userEmail, e) => {
    e.stopPropagation();
    if (userEmail) {
      navigate(`/profile/${userEmail}`);
    }
  };

  const renderPost = useCallback((post) => {
    const isLiked = post.likes?.some(like => like.email === storedUser.email);

    const handleLike = async (e) => {
      e.stopPropagation(); // Prevent post click event
      try {
        const response = await axios.post(`http://localhost:5500/api/posts/${post._id}/like`, {
          email: storedUser.email,
          name: storedUser.username
        });

        if (response.data) {
          setPosts(prevPosts => 
            prevPosts.map(p => 
              p._id === post._id 
                ? { ...p, likes: response.data.likes }
                : p
            )
          );
          
          // Only create notification when liking (not unliking)
          if (!isLiked && post.user_email !== storedUser.email) {
            try {
              // Get the post owner's ID from the post data
              const postOwnerId = post.user?._id;
              
              // If post owner ID is not available in the user object, fetch it from the server
              if (!postOwnerId) {
                console.log("Post owner ID not found in user object, fetching from server");
                try {
                  // Fetch the post to get the user_email
                  const postResponse = await axios.get(`http://localhost:5500/api/posts/${post._id}`);
                  if (postResponse.data && postResponse.data.user_email) {
                    // Fetch the user to get their ID
                    const userResponse = await axios.get(`http://localhost:5500/api/users/email/${postResponse.data.user_email}`);
                    if (userResponse.data && userResponse.data._id) {
                      // Now we have the post owner's ID
                      const ownerId = userResponse.data._id;
                      
                      console.log("Creating like notification with data:", {
                        recipientId: ownerId,
                        senderId: storedUser._id,
                        postId: post._id,
                        postImage: post.url
                      });

                      await axios.post('http://localhost:5500/api/notifications', {
                        recipientId: ownerId,
                        senderId: storedUser._id,
                        type: 'like',
                        content: `${storedUser.username} liked your post`,
                        postId: post._id,
                        postImage: post.url
                      });
                    } else {
                      console.error("Could not find user with email:", postResponse.data.user_email);
                    }
                  } else {
                    console.error("Post data does not contain user_email:", postResponse.data);
                  }
                } catch (fetchError) {
                  console.error("Error fetching post or user data:", fetchError);
                }
              } else {
                // Use the post owner ID from the user object
                console.log("Creating like notification with data:", {
                  recipientId: postOwnerId,
                  senderId: storedUser._id,
                  postId: post._id,
                  postImage: post.url
                });

                await axios.post('http://localhost:5500/api/notifications', {
                  recipientId: postOwnerId,
                  senderId: storedUser._id,
                  type: 'like',
                  content: `${storedUser.username} liked your post`,
                  postId: post._id,
                  postImage: post.url
                });
              }
            } catch (error) {
              console.error("Error creating like notification:", error.response?.data || error);
            }
          }
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    };

    const handleCommentClick = (e) => {
      e.stopPropagation(); // Prevent post click event
      setSelectedPost(post);
      setShowComments(true);
    };

    return (
      <div key={post._id} style={styles.postItem}>
        <div style={styles.postHeader}>
          <div style={styles.postHeaderUserInfo}>
            <img 
              src={post.user?.profileImage || DEFAULT_PROFILE_IMAGE} 
              alt={post.user?.username || "User"} 
              style={styles.postHeaderAvatar}
              onClick={(e) => handleUsernameClick(post.user_email || post.user?.email, e)}
            />
            <div style={styles.postHeaderUserDetails}>
              <span 
                style={styles.postHeaderUsername}
                onClick={(e) => handleUsernameClick(post.user_email || post.user?.email, e)}
              >
                {post.user?.username || post.username || "User"}
              </span>
              <span style={styles.postHeaderTime}>
                {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ 
          width: '100%', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#fafafa'
        }}>
          {renderMedia({ ...post, style: { 
            maxHeight: '600px',
            width: '100%',
            objectFit: 'contain'
          }})}
        </div>
        
        <div style={{ padding: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <button 
              onClick={handleLike}
              style={{ 
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                marginRight: '16px'
              }}
            >
              {isLiked ? (
                <FaHeart style={{ fontSize: '24px', color: '#ed4956' }} />
              ) : (
                <FaRegHeart style={{ fontSize: '24px' }} />
              )}
            </button>
            <button 
              onClick={handleCommentClick}
              style={{ 
                background: 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              <FaRegComment style={{ fontSize: '24px' }} />
            </button>
          </div>

          <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            {post.likes?.length || 0} likes
          </div>

          {post.caption && (
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              <span style={{ fontWeight: '600', marginRight: '4px' }}>
                {post.user?.username || post.username}
              </span>
              {post.caption}
            </p>
          )}
          
          <button 
            onClick={handleCommentClick}
            style={{ 
              background: 'none',
              border: 'none',
              padding: '0',
              fontSize: '14px',
              color: '#8e8e8e',
              cursor: 'pointer'
            }}
          >
            View all {post.comments?.length || 0} comments
          </button>
        </div>
      </div>
    );
  }, [storedUser.email, storedUser.username, handleUsernameClick, renderMedia]);

  const handleUserClick = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const arrangeHomepagePosts = useCallback((posts) => {
    return posts.slice(0, 120);
  }, []);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100 // Load more posts before reaching the bottom
    ) {
      setPage((prevPage) => prevPage + 1); // Increment page for pagination
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  
  return (
    <>
    <HomeNavbar /> 
    <div style={styles.container}>
      
      
      {/* Profile Section */}
      
      <div style={styles.profileSection}>
        <div style={styles.profileInfo}>
          <div style={styles.avatar}>👤</div>
          <div>
            <h2 style={styles.username}>{username}</h2>
            <p style={styles.headline}>Some Headline</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.content}>
        {/* Left Sidebar */}
        <div style={styles.leftSidebar}>
          <div style={styles.trendingContainer}>
            <div style={styles.trendingHeader}>
              <h3 style={styles.trendingTitle}>Trending Content</h3>
            </div>
            <div style={styles.trendingContent}>
              <div style={styles.trendingItem}>
                <p style={styles.trendingItemTitle}>Heritage Festival 2025</p>
                <p style={styles.trendingItemDate}>March 15-20</p>
              </div>
              <div style={styles.trendingItem}>
                <p style={styles.trendingItemTitle}>Heritage Festival 2025</p>
                <p style={styles.trendingItemDate}>March 15-20</p>
              </div>
              <div style={styles.trendingItem}>
                <p style={styles.trendingItemTitle}>Heritage Festival 2025</p>
                <p style={styles.trendingItemDate}>March 15-20</p>
              </div>
            </div>
          </div>

          {/* SuggestionsForYou component remains separate */}
          <SuggestionsForYou />
        </div>

        {/* Feed Section */}
        <div style={styles.feed}>
          <div style={styles.profileComplete}>
            <div style={styles.profileCompleteText}>
              <h3 style={styles.profileCompleteTitle}>Complete Your Profile</h3>
              <p style={styles.profileCompleteDescription}>
                Personalize your experience and connect better with the community
              </p>
            </div>
            <button 
              style={styles.completeButton}
              onClick={() => navigate('/create-profile')}
            >
              Complete
            </button>
          </div>

          {/* Post Feed */}
          <div style={styles.postFeed}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <div key={post._id} style={styles.postItem}>
                  <div
                    onClick={() => navigate(`/p/${post._id}`, { state: { background: location } })}
                    className="link"
                    style={styles.postContent}
                  >
                    {post.url ? renderPost(post) : <p>Post content unavailable</p>}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666666' }}>No posts available</p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={styles.rightSidebar}>
            {/* Remove SuggestionsForYou from here */}
        </div>
      </div>
    </div>
    
    {/* Post Popup for Comments */}
    {selectedPost && showComments && (
      <PostPopup
        post={selectedPost}
        onClose={() => {
          setSelectedPost(null);
          setShowComments(false);
        }}
        isCurrentUser={selectedPost.user_email === storedUser.email}
      />
    )}
    </>
  );

};

// Styles (unchanged from your original code)
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f2ee",
  },
  
  profileSection: {
    backgroundColor: "#80b6bb",
    padding: "15px",
  },
  profileInfo: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "40px",
    height: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "10px",
    objectFit: "cover",
  },
  username: {
    margin: 0,
    fontWeight: "bold",
    fontSize: "16px",
  },
  headline: {
    margin: 0,
    fontSize: "14px",
    color: "#444",
  },
  content: {
    display: "flex",
    margin: "20px",
    maxWidth: "1200px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  leftSidebar: {
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'sticky',
    top: '20px',
    height: 'fit-content',
  },
  trendingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  trendingHeader: {
    backgroundColor: '#80b6bb',
    padding: '12px 15px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  trendingTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    margin: 0,
  },
  trendingContent: {
    padding: '12px 15px',
    backgroundColor: '#f4f2ee',
  },
  trendingItem: {
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  trendingItemTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#000000',
    margin: '0 0 4px 0',
  },
  trendingItemDate: {
    fontSize: '12px',
    color: '#666666',
    margin: 0,
  },
  suggestion: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  suggestionAvatar: {
    marginRight: "10px",
  },
  followButton: {
    marginLeft: "auto",
    padding: "5px 10px",
    backgroundColor: "#006d77",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  feed: {
    flex: 1,
    maxWidth: "600px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  profileComplete: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileCompleteText: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  profileCompleteTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#000000",
    margin: "0",
  },
  profileCompleteDescription: {
    fontSize: "14px",
    color: "#666666",
    margin: "0",
  },
  completeButton: {
    padding: "8px 16px",
    backgroundColor: "#006d77",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#005a61",
    },
  },
  postItem: {
    marginBottom: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  postHeader: {
    backgroundColor: '#80b6bb',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  postHeaderUserInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  postHeaderAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    marginRight: '12px',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  postHeaderUserDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  postHeaderUsername: {
    color: '#000000',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '2px',
  },
  postHeaderTime: {
    color: '#000000',
    fontSize: '12px',
    opacity: 0.8,
  },
  postFeed: {
    marginBottom: '20px',
  },
  postContent: {
    width: '100%',
    display: 'block',
  },
  rightSidebar: {
    width: "220px",
    position: "sticky",
    top: "20px",
    height: "fit-content",
  },
  mediaContainer: {
    width: "100%",
    position: "relative",
    backgroundColor: "#f8f8f8",
  },
  image: {
    width: "100%",
    height: "auto",
    maxHeight: "600px",
    objectFit: "contain",
    display: "block",
  },
  video: {
    width: "100%",
    height: "600px",
    objectFit: "contain",
    backgroundColor: "#000",
  },
  reel: {
    width: "100%",
    height: "800px",
    objectFit: "cover",
    backgroundColor: "#000",
  },
  pdfContainer: {
    width: "100%",
    height: "800px",
    position: "relative",
    backgroundColor: "#f8f8f8",
  },
  audioContainer: {
    width: "100%",
    height: "400px",
    position: "relative",
    backgroundColor: "#f8f8f8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  audioThumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  audioOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  audioControls: {
    width: "90%",
    zIndex: 2,
  },
};

export default HomePage;