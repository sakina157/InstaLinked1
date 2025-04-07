import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaHeart, FaRegHeart, FaRegComment, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CommentSection = ({ currentpost, setCurrentPost }) => {
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const currentuser = JSON.parse(localStorage.getItem("user"));
  const user = { email: currentuser.email, name: currentuser.username };

  useEffect(() => {
    if (currentpost?.likes) {
      setLiked(currentpost.likes.some(like => like.email === user.email));
    }
  }, [currentpost, user.email]);

  const handleLike = async () => {
    try {
      // Add debug logging
      console.log("Current post data:", currentpost);
      console.log("Current user data:", currentuser);

      const response = await axios.post(`http://localhost:5500/api/posts/${currentpost._id}/like`, {
        email: user.email,
        name: user.name
      });

      if (response.data && response.data.likes) {
        setCurrentPost(prev => ({
          ...prev,
          likes: response.data.likes
        }));
        setLiked(!liked);

        // Only create notification when liking (not unliking)
        if (!liked && currentpost.user_email !== user.email) {
          try {
            // Get the post owner's ID from the populated user object
            const postOwnerId = currentpost.user?._id;
            if (!postOwnerId) {
              console.error("Post owner ID not found in:", currentpost);
              return;
            }

            console.log("Creating like notification with data:", {
              recipientId: postOwnerId,
              senderId: currentuser._id,
              postId: currentpost._id,
              postImage: currentpost.url
            });

            await axios.post('http://localhost:5500/api/notifications', {
              recipientId: postOwnerId,
              senderId: currentuser._id,
              type: 'like',
              content: `${currentuser.username} liked your post`,
              postId: currentpost._id,
              postImage: currentpost.url
            });
          } catch (error) {
            console.error("Error creating like notification:", error.response?.data || error);
          }
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const postId = currentpost._id;
      if (!postId) {
        console.error("No post ID found");
        return;
      }

      const response = await axios.post(`http://localhost:5500/api/posts/${postId}/comment`, {
        email: user.email,
        name: user.name,
        text: commentText.trim()
      });

      if (response.data) {
        setCurrentPost(prev => ({
          ...prev,
          comments: response.data
        }));
        setCommentText("");

        // Create notification for comment if not commenting on own post
        if (currentpost.user_email !== user.email) {
          try {
            // Get the post owner's ID from the post data
            const postOwnerId = currentpost.user?._id;
            if (!postOwnerId) {
              console.error("Post owner ID not found");
              return;
            }

            await axios.post('http://localhost:5500/api/notifications', {
              recipientId: postOwnerId,
              senderId: currentuser._id,
              type: 'comment',
              content: `${currentuser.username} commented on your post: "${commentText.trim().substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
              postId: currentpost._id,
              postImage: currentpost.url
            });
          } catch (error) {
            console.error("Error creating comment notification:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameClick = (email, e) => {
    e.stopPropagation();
    navigate(`/profile/${email}`);
  };

  if (!currentpost) return null;

  return (
    <>
      <CommentsContainer>
        {currentpost.caption && (
          <Comment>
            <UserImg src={currentpost.user?.profileImage} alt="User" />
            <CommentText>
              <CommentUser onClick={(e) => handleUsernameClick(currentpost.user_email, e)}>
                {currentpost.user?.username}
              </CommentUser> 
              {currentpost.caption}
              <CommentTime>{new Date(currentpost.created_at).toLocaleString()}</CommentTime>
            </CommentText>
          </Comment>
        )}
        
        {currentpost.comments?.map((comment, index) => (
          <Comment key={index}>
            <UserImg 
              src={comment.email === user.email ? currentuser.profileImage : currentpost.user?.profileImage} 
              alt={comment.name} 
            />
            <CommentText>
              <CommentUser onClick={(e) => handleUsernameClick(comment.email, e)}>
                {comment.name}
              </CommentUser> 
              {comment.comment}
              <CommentTime>{new Date(comment.created_at).toLocaleString()}</CommentTime>
            </CommentText>
          </Comment>
        ))}
      </CommentsContainer>

      <BottomSection>
        <InteractionBar>
          <LeftIcons>
            <IconButton onClick={handleLike}>
              {liked ? <FaHeart color="red" /> : <FaRegHeart />}
            </IconButton>
            <IconButton>
              <FaRegComment />
            </IconButton>
            <IconButton>
              <FaPaperPlane />
            </IconButton>
          </LeftIcons>
        </InteractionBar>

        <LikesCount>{currentpost.likes?.length || 0} likes</LikesCount>

        <CommentInputContainer>
          <CommentInput
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleComment();
              }
            }}
          />
          <PostButton 
            onClick={handleComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            Post
          </PostButton>
        </CommentInputContainer>
      </BottomSection>
    </>
  );
};

export default CommentSection;

// Styled Components
const CommentsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const BottomSection = styled.div`
  border-top: 1px solid #efefef;
  margin-top: auto;
`;

const InteractionBar = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
`;

const LeftIcons = styled.div`
  display: flex;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 24px;
    color: #262626;
  }
  
  &:hover {
    opacity: 0.7;
  }
`;

const LikesCount = styled.div`
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Comment = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const UserImg = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
`;

const CommentText = styled.div`
  font-size: 14px;
  flex: 1;
`;

const CommentUser = styled.span`
  font-weight: 600;
  margin-right: 6px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #8e8e8e;
  margin-top: 4px;
`;

const CommentInputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #efefef;
`;

const CommentInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px 0;
  
  &::placeholder {
    color: #8e8e8e;
  }
`;

const PostButton = styled.button`
  border: none;
  background: none;
  color: #0095f6;
  font-weight: 600;
  font-size: 14px;
  padding: 8px;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.3 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover:not(:disabled) {
    color: #00376b;
  }
`;