import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import default_user from '../images/default_user.jpg'
import HomeNavbar from "./HomeNavbar";

// Reusable Post Component
const Post = ({ post }) => {
  return (
    <div style={styles.postCard}>
      <div style={styles.postHeader}>
        <span style={styles.avatar}>👤</span>
        <div>
          <strong>{post.userEmail}</strong>
          <p style={styles.role}>{post.role} • {post.time}</p>
        </div>
      </div>
      <p style={styles.postText}>{post.text}</p>
      {post.mediaUrl && (
        post.mediaType === "video" ? (
          <video controls width="100%" style={styles.postMedia}>
            <source src={post.mediaUrl} type="video/mp4" />
          </video>
        ) : post.mediaType === "pdf" ? (
          <iframe
            src={post.mediaUrl}
            width="100%"
            height="500px"
            style={styles.postMedia}
            title="PDF Viewer"
          />
        ) : post.mediaType === "audio" ? (
          <audio controls style={styles.postMedia}>
            <source src={post.mediaUrl} type="audio/mpeg" />
          </audio>
        ) : (
          <img src={post.mediaUrl} alt="Post" style={styles.postMedia} />
        )
      )}
      <p style={styles.postText}>{post.text}</p>
      <p style={styles.category}>{post.category}</p> {/* Display category */}
      <div style={styles.postActions}>
        <button style={styles.actionButton}>❤️ Like</button>
        <button style={styles.actionButton}>💬 Comment</button>
        <button style={styles.actionButton}>➕ Follow</button>
      </div>
    </div>
  );
};

const HomePage = () => {
  
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();
  const [username, setUsername] = useState(storedUser.username || "Loading...");
  const [profileImage, setProfileImage] = useState(storedUser.profileImage || default_user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 

  // ✅ Get email from LocalStorage
  const userEmail = localStorage.getItem("email");

  const fetchUserData = useCallback(async () => {
    console.log("Fetching user data for email:", userEmail);
    try {
      const response = await axios.get("http://localhost:5500/api/user/data", {
        params: { email: userEmail },
        withCredentials: true, // Ensure cookies are sent
      });

      if (response.data) {
        setUsername(response.data.username);
        setProfileImage(response.data.profileImage);

        // ✅ Update LocalStorage to prevent refresh issue
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("profileImage", response.data.profileImage);

        console.log("Updated user data from MongoDB.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [userEmail]); 
  
  
// Call fetchUserData on mount
useEffect(() => {
  fetchUserData();  // ✅ Call function inside useEffect
}, [fetchUserData]);  // ✅ Empty dependency array

const fetchRandomPosts = useCallback(async () => {
  try {
    const response = await axios.get(`http://localhost:5500/api/random-media/${storedUser._id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching random posts:", error);
    return [];
  }
}, [storedUser._id]);
  
  // Fetch feed data
  const fetchFeed = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const [personalizedResponse, randomPosts] = await Promise.all([
        axios.get(`http://localhost:5500/api/feed?email=${userEmail}&page=${page}`),
        fetchRandomPosts(),
      ]);
  
      const combinedPosts = [...personalizedResponse.data, ...randomPosts];
      const uniquePosts = Array.from(new Set(combinedPosts.map((post) => post._id)))
        .map((id) => combinedPosts.find((post) => post._id === id));
  
      setPosts(uniquePosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [userEmail, fetchRandomPosts, page]);

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
  
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

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

            {loading ? (
              <p>Loading posts...</p>
            ) : (
              posts.map((post) => (
                <Post key={post._id} post={post} />
              ))
            )}
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
  },
  leftSidebar: {
    width: "220px",
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "5px",
    marginRight: "20px",
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
  postGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  postCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  postHeader: {
    display: "flex",
    alignItems: "center",
  },
  postText: {
    marginTop: "10px",
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
  },
};

export default HomePage;