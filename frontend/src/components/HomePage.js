import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaHome, FaPlusCircle, FaBell, FaEnvelope, FaCog,FaWpexplorer } from "react-icons/fa";
import default_user from '../images/default_user.jpg'
import logo from "../images/logo.svg"
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../firebaseConfig";



// Reusable Post Component
const Post = ({ post, onLike }) => {
  const [liked, setLiked] = useState(post.likes.includes(post.userEmail));


  const handleLike = () => {
    setLiked(!liked);
    onLike(post._id);
  };

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
        post.mediaUrl.includes("video") ? (
          <video controls width="100%" style={styles.postMedia}>
            <source src={post.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={post.mediaUrl} alt="Post" style={styles.postMedia} />
        )
      )}
      <div style={styles.postActions}>
        <button style={styles.actionButton} onClick={handleLike}>
          👍 {post.likes.length}
        </button>
        <button style={styles.actionButton}>💬 {post.comments.length}</button>
        <button style={styles.actionButton}>🔗 Share</button>
      </div>
    </div>
  );
};


// Reusable Reel Component
const Reel = ({ reel, onLike }) => {
  const [liked, setLiked] = useState(reel.likes.includes(reel.userEmail));

  const handleLike = () => {
    setLiked(!liked);
    onLike(reel._id);
  };

  return (
    <div style={styles.reelCard}>
      <div style={styles.reelHeader}>
        <span style={styles.avatar}>👤</span>
        <div>
          <strong>{reel.userEmail}</strong>
          <p style={styles.role}>{reel.role} • {reel.time}</p>
        </div>
      </div>
      <video src={reel.videoUrl} controls style={styles.reelVideo} />
      <div style={styles.reelActions}>
        <button style={styles.actionButton} onClick={handleLike}>
          👍 {reel.likes.length}
        </button>
        <button style={styles.actionButton}>💬 {reel.comments.length}</button>
        <button style={styles.actionButton}>🔗 Share</button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();
  const [username, setUsername] = useState("John Doe"); // Default fallback
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const userEmail = localStorage.getItem("email");
  

  const fetchMongoDBUser = async (firebaseUser) => {
    try {
        const response = await axios.get(`http://localhost:5500/api/users/profile/${firebaseUser.email}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching MongoDB user:", error);
        return null;
    }
};

useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (User) => {
        if (User) {
            const mongoUser = await fetchMongoDBUser(User);
            if (mongoUser) {
                setUsername(mongoUser.username);  // ✅ Now using MongoDB's username
                console.log("MongoDB Username:", mongoUser.username);
            }
        }
    });

    return () => unsubscribe();  // Cleanup function
}, []);


  // ✅ Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5500/api/search?q=${searchQuery}`);
      console.log("Search Results:", response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
    setLoading(false);
  };

  


  const fetchUserData = async () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        console.error("No user data found in localStorage.");
        return;
    }

    try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Stored User After Refresh:", parsedUser); // ✅ Debugging

        if (!parsedUser._id) {
            console.error("Error: No user ID found in localStorage.");
            return;
        }

        console.log("Fetching user data for userId:", parsedUser._id);

        const response = await axios.get(`http://localhost:5500/api/users/${parsedUser._id}`);

        console.log("Fetched user data:", response.data); // ✅ Debugging

        if (response.data.username) {
            console.log("Updating username:", response.data.username);
            setUsername(response.data.username);  // ✅ Ensure correct username is set
        } else {
            console.error("Username not found in response.");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }
};


// ✅ Call this function in useEffect
useEffect(() => {
    fetchUserData();
}, []);

  
  



  // Fetch feed data
  const fetchFeed = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5500/api/feed?email=${userEmail}&page=${page}`);
      setPosts((prev) => [...prev, ...response.data]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, userEmail]);

  // Fetch feed on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5500/api/posts");
        const data = await response.json();
        console.log("Fetched posts:", data); // Debugging
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
  
    fetchPosts();
  }, []);
  
  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      fetchFeed();
    }
  }, [fetchFeed]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Handle like
  const handleLike = async (postId) => {
    if (!userEmail) return;
    try {
      await axios.post(`http://localhost:5500/api/like/${postId}`, { email: userEmail });
      setPosts(posts.map(post =>
        post._id === postId
          ? { ...post, likes: post.likes.includes(userEmail) ? post.likes.filter(like => like !== userEmail) : [...post.likes, userEmail] }
          : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  

  return (
    <div style={styles.container}>
      <nav style={styles.navbarContainer}>
      <div style={styles.leftSection}>
      <img src={logo} alt="InstaLinked" style={styles.logo} />

                {/* Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={styles.searchButton}>Search</button>
        </div>

        {/* Right Section */}
    <div style={styles.rightSection}>
      <a href="/Home" style={styles.navIcon}><FaHome /></a>
      <a href="/explore-page" style={styles.navIcon}><FaWpexplorer /></a>
      <a href="/create-post" style={styles.navIcon}><FaPlusCircle /></a>
      <div style={styles.navIcon}>
        <FaBell />
        {/* <span style={styles.notificationBadge}>12</span> */}
      </div>
      <a href="/messages" style={styles.navIcon}><FaEnvelope /></a>
      <Link to={`/profile/${user._id}`} style={styles.navIcon}>
      <img src={user.profileImage || default_user} alt="User Profile" style={styles.profileImage} />
    </Link>
  
      <a href="/settings" style={styles.navIcon}><FaCog /></a>
    </div>
  </div>

      </nav>

                {/* Search Results */}

{!loading && searchResults.length > 0 && (
  <ul style={styles.searchResultsContainer}>
    {searchResults.map(user => (
      <li key={user._id} style={styles.searchItem}>
      <div style={styles.profileContainer}>
        <img
          src={user.profilePicture || "default_user.jpg"}
          alt="Profile"
          style={styles.avatar}
        />
        <span style={styles.username}>{user.username || user.email}</span>
      </div>
      <button
        style={styles.viewProfileButton}
        onClick={() => navigate(`/profile/${user._id}`)}
      >
        View Profile
      </button>
    </li>
  ))}
</ul>
)}
      

               
    

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
        <div style={styles.content}>
        <div style={styles.feed}>
          <div style={styles.profileComplete}>
            <p><strong>Complete Your Profile</strong></p>
            <p>Personalize your experience and connect better with the community</p>
            <button style={styles.completeButton}>Complete</button>
          </div>

          {loading ? (
            <p>Loading posts...</p>
          ) : (
            posts.map((post) =>
              post.type === "post" ? (
                <Post key={post._id} post={post} onLike={handleLike} />
              ) : (
                <Reel key={post._id} reel={post} onLike={handleLike} />
              )
            )
          )}
          </div>

        {/* Right Sidebar */}
        <div style={styles.rightSidebar}></div>
      </div>
    </div>
    
    </div>
  );

};

// Styles (unchanged from your original code)
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f2ee",
  },
  navbarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#006d77",
    padding: "10px 20px",
    color: "#ffffff",
    width: "100%",
    height:"8vh"
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flex: 0.98,
  },
  logo: {
    width: "120px",  // ✅ Adjust size as needed
    height: "100%",
    position:"relative",
  },
  searchContainer: {
    display: "flex",
    padding: "8px",
    alignItems: "center", 
    borderRadius: "5px",
    border: "none",
    width: "250px",
    gap: "4px", 
  },
  searchInput: {
    padding: "5px",
    borderRadius: "4px",
    width: "210px",
  },
  searchButton: {
    marginRight: "5px",
    padding: "5px 10px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginLeft: "auto", // Push icons to the right
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  navIcon: {
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    textDecoration: "none",
    position: "relative",
  },
  profileImage: {
    height: "30px",
    width: "30px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid white",
    cursor: "pointer",
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-8px",
    backgroundColor: "red",
    color: "white",
    fontSize: "12px",
    borderRadius: "50%",
    padding: "2px 6px",
  },

  searchResultsContainer: {
    position: "absolute",
    top: "50px", // Adjust based on Navbar height
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    width: "300px",
    zIndex: 1000,
  },
  searchItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
  },
  loadingContainer: {
    position: "relative",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "8px 16px",
    borderRadius: "5px",
    fontWeight: "bold",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
  },
  
  profileContainer: {
    display: "flex",
    alignItems: "center", // Aligns profile image and username horizontally
    gap: "10px", // Adds space between image and text
  },
  

  viewProfileButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "3px 8px",
    cursor: "pointer",
  },
  icons: {
    display: "flex",
    gap: "15px",
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
  rightSidebar: {
    width: "220px",
  },
};

export default HomePage;