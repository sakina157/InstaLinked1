import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaHeart, FaRegComment, FaPaperPlane, FaBookmark } from "react-icons/fa";

const CommentSection = ({ currentpost, setCurrentPost }) => {
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  const currentuser = JSON.parse(localStorage.getItem("user"));

  console.log(currentuser.email,currentuser.fullname)
  const user = { email: currentuser.email, name: currentuser.fullname };

  // Check if user has already liked the post
  useEffect(() => {
    setLiked(currentpost.likes.some(like => like.email === user.email));
  }, [currentpost]);

  const handleLike = async () => {
    try {
      const res = await axios.post(`/api/posts/${currentpost._id}/like`, user);
      const updatedPost = await axios.get(`/api/posts/${currentpost._id}`);

      // Update the state with the latest data
      setCurrentPost(updatedPost.data);
      console.log("current post",currentpost)

      setLiked(currentpost.likes.some(like => like.email === user.email));

      console.log("Liked Status:", updatedPost.data.likes.includes(user.email));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async () => {
    if (!commentText) return;
    try {
      const res = await axios.post(`/api/posts/${currentpost._id}/comment`, {
        ...user,
        text: commentText,
      });
      setCurrentPost(prev => ({ ...prev, comments: res.data }));
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleShare = async () => {
    try {
      const res = await axios.post(`/api/posts/${currentpost._id}/share`);
      setCurrentPost(prev => ({ ...prev, shares: res.data.shares }));
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  if (!currentpost) return <p>Loading...</p>;

  return (
    <>
      <StatsContainer>
        <div style={{ display: "flex" }}>
          <StatItem>
            <button
              style={{ border: "none", background: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <FaHeart style={{ color: liked ? "red" : "gray", transition: "color 0.3s ease" }} />
            </button>
            {currentpost.likes.length}
          </StatItem>
          <StatItem>
            <button style={{ border: "none", background: "none" }}>
              <FaRegComment />
            </button>
            {currentpost.comments.length}
          </StatItem>
          <StatItem>
            <button style={{ border: "none", background: "none" }} onClick={handleShare}>
              <FaPaperPlane />
            </button>
            {currentpost.shares}
          </StatItem>
        </div>
        <FaBookmark />
      </StatsContainer>

      <CommentList>
        {currentpost.comments.map((comment, index) => (
          <Comment key={index}>
            <UserImg src={currentuser.profileImage} alt="User" />
            <CommentText>
              <CommentUser>{comment.name}</CommentUser> {comment.text}
              <CommentTime>{new Date(comment.createdAt).toLocaleString()}</CommentTime>
            </CommentText>
          </Comment>
        ))}
      </CommentList>

      <CommentInputContainer>
        <CommentInput
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <PostButton onClick={handleComment}>Post</PostButton>
      </CommentInputContainer>
    </>
  );
};

export default CommentSection;

// Styled Components
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 16px;
  svg {
    margin-right: 6px;
    font-size: 20px;
  }
`;

const CommentList = styled.div`
  margin-top: 12px;
  padding: 10px;
`;

const Comment = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const UserImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const CommentText = styled.div`
  margin-left: 12px;
`;

const CommentUser = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

const CommentTime = styled.p`
  font-size: 12px;
  color: #777;
  margin: 2px 0;
`;

const CommentInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 10px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
`;

const PostButton = styled.button`
  margin-left: 8px;
  background-color: #008080;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
`;