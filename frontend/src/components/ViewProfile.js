import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import AppNavbar from './AppNavbar';


const ViewProfile = () => {
  const { userId } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user info

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser)); // ✅ Now we have logged-in user info
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5500/api/user/${userId}`);
        const data = await response.json();
        console.log("Fetched User Data:", data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <>
    <AppNavbar /> 
    <div style={styles.container}>
      {/* Left Section */}
      <div style={styles.leftSection}>
        {/* Profile Section */}
        <div style={styles.profileCard}>
          <img
            src={user?.profilePicture || "default-avatar.png"}
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
            <div style={styles.buttons}>
              {/* ✅ Show Edit Profile Button Only for Logged-in User */}
              {loggedInUser?._id === user?._id && (
                <button style={styles.editButton} onClick={() => navigate("/create-profile")}>
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
    </>
  );
};

// Your Existing Styles (No changes)
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f2ee",
    color: "#000",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: "80px",
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
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    marginRight: "20px",
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
    backgroundColor: "#80b6bb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
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
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  postCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
  },
};

export default ViewProfile;