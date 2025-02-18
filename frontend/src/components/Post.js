import React, { useState, useEffect } from "react";

const Post = ({ post, onLike }) => {
  const userEmail = localStorage.getItem("email");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(post.likes.includes(userEmail));
  }, [post.likes, userEmail]);

  const handleLike = () => {
    setLiked(!liked);
    onLike(post._id);

    // Optimistic UI Update
    post.likes = liked
      ? post.likes.filter(email => email !== userEmail)
      : [...post.likes, userEmail];
  };

  return (
    <div style={styles.postCard}>
      <div style={styles.postHeader}>
        <span style={styles.avatar}>👤</span>
        <div>
          <strong>{post.user}</strong>
          <p style={styles.role}>{post.role} • {post.time}</p>
        </div>
      </div>
      <p style={styles.postText}>{post.text}</p>

      {/* Display Image from Cloudinary */}
      {post.image && <img src={post.image} alt="Post" style={styles.postImage} />}

      <div style={styles.postActions}>
        <button style={styles.actionButton} onClick={handleLike}>
          👍 {post.likes?.length || 0}
        </button>
        <button style={styles.actionButton}>💬 {post.comments?.length || 0}</button>
        <button style={styles.actionButton}>🔗 Share</button>
      </div>
    </div>
  );
};

// Example styles
const styles = {
  postCard: { border: "1px solid #ccc", padding: "10px", margin: "10px 0" },
  postHeader: { display: "flex", alignItems: "center" },
  avatar: { fontSize: "24px", marginRight: "10px" },
  role: { fontSize: "12px", color: "#777" },
  postText: { margin: "10px 0" },
  postImage: { width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "8px" },
  postActions: { display: "flex", justifyContent: "space-between", marginTop: "10px" },
  actionButton: { cursor: "pointer", border: "none", background: "none", fontSize: "14px" },
};

export default Post;
