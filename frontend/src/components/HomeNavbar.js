import React, { useState } from "react";
import { FaHome, FaPlusCircle, FaBell, FaEnvelope, FaCog,FaWpexplorer } from "react-icons/fa";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import default_user from '../images/default_user.jpg'
import logo from "../images/logo.svg"
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const { unreadCount } = useSocket();
    const [profileImage] = useState(storedUser.profileImage || default_user);
    const user = storedUser._id ? storedUser : null; 
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    
     // ✅ Search users
     const handleSearch = async () => {
      if (!searchQuery.trim()) {
          console.log("Search query is empty");
          setSearchResults([]); // Clear previous results
          return;
      }
      setLoading(true);
      console.log("Searching for:", searchQuery);
      try {
          // Encode the search query to handle special characters
          const encodedQuery = encodeURIComponent(searchQuery.trim());
          const response = await axios.get(`http://localhost:5500/api/homesearch/search?q=${encodedQuery}`, {
            withCredentials: true // Add this to handle cookies if needed
          });
          console.log("Search Results:", response.data);
          setSearchResults(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
          console.error("Error searching users:", error);
          setSearchResults([]); // Clear results on error
      } finally {
          setLoading(false);
      }
  };
  
  // Debounce search to prevent too many API calls
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
      return;
    }
    // Add small delay before searching
    setTimeout(() => {
      if (e.target.value === searchQuery) {
        handleSearch();
      }
    }, 300);
  };

 return (
    <div>
      <nav style={styles.navbarContainer}>
      <div style={styles.leftSection}>
      <img src={logo} alt="InstaLinked" style={styles.logo} />

                {/* Search Bar */}
          <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={styles.searchButton}>Search</button>
        </div>

        {/* Right Section */}
    <div style={styles.rightSection}>
      <a href="/Home" style={styles.navIcon}><FaHome /></a>
      <a href="/explore-page" style={styles.navIcon}><FaWpexplorer /></a>
      <a href="/create-post" style={styles.navIcon}><FaPlusCircle /></a>
      <Link to="/notifications" style={styles.navIcon}>
      <FaBell />
      {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
      </Link>
      <a href="/messages" style={styles.navIcon}><FaEnvelope /></a>
      <Link to={`/profile/${user?._id || ""}`} style={styles.navIcon}>
      <img src={profileImage} alt="User Profile" style={styles.profileImage} />
    </Link>
  
      <a href="/settings" style={styles.navIcon}><FaCog /></a>
    </div>
  </div>

      </nav>

                {/* Search Results */}
                {searchQuery.trim() && !loading && searchResults.length > 0 && (
  <ul style={styles.searchResultsContainer}>
    {searchResults.map(user => (
      <li key={user._id} style={styles.searchItem}>
      <div style={styles.profileContainer}>
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
</div>
 );
};
  

export default Navbar;

// Styles (unchanged from your original code)
const styles = {
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
        width: "400px",
        gap: "4px", 
      },
      searchInput: {
        padding: "8px",
        borderRadius: "4px",
        width: "350px",
        fontSize: "14px",
      },
      searchButton: {
        marginRight: "5px",
        padding: "8px 15px",
        backgroundColor: "#ffffff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
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
        top: "60px",
        left: "220px",
        transform: "none",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
        width: "400px",
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
    };