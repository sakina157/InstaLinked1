import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import default_user from '../images/default_user.jpg';
import HomeNavbar from "./HomeNavbar";
import disk from '../images/disk.jpg';
import { useRef } from "react";

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
      const response = await axios.get("http://localhost:5500/api/feed/homepage");
      if (Array.isArray(response.data)) {
        const arranged = arrangeHomepagePosts(response.data);
        setPosts(arranged);
        setFilteredPosts(arranged);
        localStorage.setItem('homepagePosts', JSON.stringify(arranged));
      }
    } catch (error) {
      console.error('Error fetching homepage posts:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (window.performance.getEntriesByType("navigation")[0].type === "reload") {
      localStorage.removeItem("homepagePosts");
      fetchHomepagePosts();
    } else {
      const storedPosts = localStorage.getItem('homepagePosts');
      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts);
        setPosts(parsedPosts);
        setFilteredPosts(parsedPosts);
      } else {
        fetchHomepagePosts();
      }
    }
  }, [fetchHomepagePosts]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = posts.filter(post => post.category === selectedCategory);
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedCategory, posts]);

  const getUserData = useCallback((post) => ({
    fullName: post.user?.fullName || "Demo User",
    profileImage: post.user?.profileImage || DEFAULT_PROFILE_IMAGE
  }), []);

  const renderMedia = useCallback((post) => {
    const postStyle = {
      ...mediaStyle,
      marginBottom: post.marginBottom || '20px'
    };

    switch (post.content_type) {
      case 'image':
        return (
          <img
            src={post.url}
            alt={post.caption}
            style={postStyle}
            loading="lazy"
          />
        );
      case 'video':
        return (
          <video
            src={post.url}
            style={postStyle}
            controls
            autoPlay={post.autoPlay}
            muted={post.autoPlay}
            loop
            playsInline
          />
        );
      case 'audio':
        return (
          <div style={{ marginBottom: post.marginBottom || '20px' }}>
            <img
              src={disk}
              alt="Audio thumbnail"
              style={{ width: '100%', maxWidth: '470px', borderRadius: '8px' }}
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
          <div style={{ marginBottom: post.marginBottom || '20px' }}>
            <img
              src={post.thumbnail || DEFAULT_PROFILE_IMAGE}
              alt="PDF thumbnail"
              style={{ width: '100%', maxWidth: '470px', borderRadius: '8px' }}
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
  }, [mediaStyle]);

  const renderPost = useCallback((post) => {
    const user = getUserData(post);

    return (
      <div key={post._id} className="post-container" style={{ marginBottom: post.marginBottom || '20px' }}>
        <div className="post-header">
          <span className="username">{user.fullName}</span>
        </div>
        
        {post.isCarousel ? (
          <div className="carousel-container">
            {post.carouselImages?.map((image, index) => (
              <img
                key={index}
                src={`https://res.cloudinary.com/do4ekgroe/${image}`}
                alt={`Carousel image ${index + 1}`}
                style={mediaStyle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        ) : (
          renderMedia(post)
        )}

        <div className="post-actions">
          <div className="likes">{post.likes || 0} likes</div>
          <div className="comments">{post.comments || 0} comments</div>
        </div>
        
        <div className="post-caption">
          <span className="username">{user.fullName}</span>
          {post.caption}
        </div>
      </div>
    );
  }, [getUserData, renderMedia, mediaStyle]);

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
          <h3>Trending Content</h3>
          <div style={styles.trendingItem}>
            <p><strong>Heritage Festival 2025</strong></p>
            <p>March 15-20</p>
          </div>
          <div style={styles.trendingItem}>
            <p><strong>Heritage Festival 2025</strong></p>
            <p>March 15-20</p>
          </div>

          <h3>Suggested for You</h3>
          <div style={styles.suggestion}>
            <span style={styles.suggestionAvatar}>👤</span>
            <div>
              <strong>Alex Turner</strong>
              <p>Product Manager at Tech Inc</p>
            </div>
            <button style={styles.followButton}>Follow</button>
          </div>
          <div style={styles.suggestion}>
            <span style={styles.suggestionAvatar}>👤</span>
            <div>
              <strong>Emily Chen</strong>
              <p>UX Designer at Design Studio</p>
            </div>
            <button style={styles.followButton}>Follow</button>
          </div>
          <div style={styles.suggestion}>
            <span style={styles.suggestionAvatar}>👤</span>
            <div>
              <strong>David Kim</strong>
              <p>Frontend Developer at Web Co</p>
            </div>
            <button style={styles.followButton}>Follow</button>
          </div>
        </div>

        {/* Feed Section */}
<div style={styles.feed}>
    <div style={styles.profileComplete}>
        <p><strong>Complete Your Profile</strong></p>
        <p>Personalize your experience and connect better with the community</p>
        <button style={styles.completeButton}>Complete</button>
    </div>

    {/* Post Feed (One Post Per Row) */}
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
            <p className="text-center text-gray-500">No posts available</p>
        )}
    </div>
</div>


        {/* Right Sidebar */}
        <div style={styles.rightSidebar}></div>
      </div>
    </div>
    
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
    width: "220px",
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "5px",
    marginRight: "20px",
    position: "sticky",
    top: "20px",
    height: "fit-content",
  },
  trendingItem: {
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#f4f2ee",
    borderRadius: "5px",
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
  },
  profileComplete: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "5px",
    textAlign: "center",
  },
  completeButton: {
    padding: "10px 15px",
    backgroundColor: "#006d77",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  
  postImage: {
    height: "200px",
    backgroundColor: "#ddd",
    marginTop: "10px",
    textAlign: "center",
    lineHeight: "200px",
  },
  postActions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  actionButton: {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  postMedia: {
    width: "100%",
    marginTop: "10px",
  },
  category: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#666",
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