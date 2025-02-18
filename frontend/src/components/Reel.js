import React, { useState } from "react";

const Reel = ({ reel, onLike }) => {
  const userEmail = localStorage.getItem("email");
  const [liked, setLiked] = useState(reel.likes.includes(userEmail));

  const handleLike = () => {
    setLiked(!liked);
    onLike(reel._id);

    // Optimistic UI Update
    reel.likes = liked
      ? reel.likes.filter(email => email !== userEmail)
      : [...reel.likes, userEmail];
  };

  return (
    <div style={styles.reelCard}>
      <div style={styles.reelHeader}>
        <span style={styles.avatar}>👤</span>
        <div>
          <strong>{reel.user}</strong>
          <p style={styles.role}>{reel.role} • {reel.time}</p>
        </div>
      </div>
      <video src={reel.videoUrl} controls style={styles.reelVideo} />
      <div style={styles.reelActions}>
        <button style={styles.actionButton} onClick={handleLike}>
          👍 {reel.likes?.length || 0}
        </button>
        <button style={styles.actionButton}>💬 {reel.comments?.length || 0}</button>
        <button style={styles.actionButton}>🔗 Share</button>
      </div>
    </div>
  );
};

const styles = {
  reelCard: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  reelHeader: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "40px",
    height: "40px",
    backgroundColor: "#ddd",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "10px",
  },
  role: {
    fontSize: "12px",
    color: "#555",
  },
  reelVideo: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
    marginTop: "10px",
    borderRadius: "5px",
  },
  reelActions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  actionButton: {
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
};

export default Reel;
