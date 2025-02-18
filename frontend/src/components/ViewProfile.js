import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Get user ID from URL
import { useNavigate } from "react-router-dom"; // For navigation
import {  FaShareAlt } from "react-icons/fa"; // Icons
//import AppNavbar from './AppNavbar';
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth"; 

const ViewProfile = () => {
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [currentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Firebase Logged-in User:", user);
        setFirebaseUser(user); // Set logged-in user
      } else {
        console.log("❌ No user found in Firebase!");
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    console.log("✅ Fetched Profile User ID:", userId);
    console.log("🔥 Current Logged-in Firebase User ID:", firebaseUser?.uid);
    console.log("📌 Profile Page User ID:", userId);
  }, [firebaseUser, userId]);


  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        setLoading(true); // Start loading
        console.log(`Fetching user data from: http://localhost:5500/api/user/${userId}`);

        const response = await fetch(`http://localhost:5500/api/user/${userId}`);

        // Debugging step: Log the full response
        const textResponse = await response.text();
        console.log("Full API Response:", textResponse);

        // Check if response is HTML (indicating an error)
        if (textResponse.startsWith("<!DOCTYPE html")) {
          throw new Error("Received HTML instead of JSON. Backend route may be incorrect.");
        }

        // Parse JSON manually
        const data = JSON.parse(textResponse);
        console.log("Fetched User Data:", data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Stop loading after fetching
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found</p>;


  return (
    <div style={styles.container}>
    
      
      {/* Left Section */}
    <div style={styles.leftSection}>

      {/* Profile Section */}
      <div style={styles.profileCard}>
        <img
          src={user?.profilePicture || "default-avatar.png"} // ✅ Fix: Safe access with fallback image
          alt="Profile"
          style={styles.profileImage}
        />
        <div style={styles.userInfo}>
          <h2 style={styles.name}>{user?.email || "No Email Available"}</h2>
          <p style={styles.username}>@{user?.username || "N/A"}</p>
          <p style={styles.job}>{user?.jobTitle || "No Job"} at {user?.company || "Unknown Company"}</p>
          <p style={styles.location}>{user?.location || "Location Unavailable"}</p>
          <div style={styles.stats}>
            <span>{user?.postsCount || 0} Posts</span>
            <span>{user?.followersCount || 0} Followers</span>
            <span>{user?.followingCount || 0} Following</span>
          </div>
          <div ><p>{firebaseUser?.email}</p>
             </div>
          <div style={styles.buttons}>
          {firebaseUser?.email === user?.email && (
                <button style={styles.editButton} onClick={() => navigate("/edit-profile")}>
                  Edit Profile
                </button>
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

      {/* Analytics Section */}
      <div style={styles.section}>
        <h3>Analytics</h3>
        <p>Coming soon...</p>
      </div>

      {/* Posts Section */}
      <div style={styles.section}>
        <h3>Posts</h3>
        <div style={styles.postGrid}>
          {Array.isArray(user?.posts) && user.posts.length > 0 ? (
            user.posts.map((post, index) => (
              <div key={index} style={styles.postCard}>
                <p>{post.title}</p>
                <span>{post.date}</span>
              </div>
            ))
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
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f2ee",
    color: "#000",
    padding: "20px",
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    paddingTop: "60px",
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
    //alignItems: "center",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    margin: "20px 0",
  },
  profileImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginRight: "15px",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  username: {
    color: "#80b6bb",
  },
  job: {
    fontSize: "14px",
    color: "#666",
  },
  location: {
    fontSize: "14px",
    color: "#666",
  },

  activitySection: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  activityBox: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },
  suggestionSection: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
  },
  suggestionBox: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },
  followButton: {
    backgroundColor: "#80b6bb",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
  },
  stats: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  buttons: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  editButton: {
    backgroundColor: "#006d77",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  shareButton: {
    backgroundColor: "#80b6bb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  section: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
  },
  postGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  postCard: {
    backgroundColor: "#f4f2ee",
    padding: "10px",
    borderRadius: "5px",
  },
};

export default ViewProfile;
