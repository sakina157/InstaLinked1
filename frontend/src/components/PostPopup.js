import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { FaHeart, FaRegHeart, FaRegComment, FaEllipsisH, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CommentSection from './UserInteraction';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  display: flex;
  background: white;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  border-radius: 4px;
  overflow: hidden;
`;

const LeftSection = styled.div`
  flex: 1;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const RightSection = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #dbdbdb;
  background: white;
  height: 100%;
`;

const Header = styled.div`
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dbdbdb;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const Username = styled.span`
  font-weight: 600;
`;

const OptionsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  &:hover {
    opacity: 0.7;
  }
`;

const OptionsMenu = styled.div`
  position: absolute;
  right: 10px;
  top: 50px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
`;

const OptionItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.isDelete ? '#ed4956' : 'inherit'};
  
  &:hover {
    background: #f8f8f8;
  }
`;

const PostPopup = ({ post, onClose, isCurrentUser }) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`http://localhost:5500/api/posts/${post._id}`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }, [post._id, onClose]);

  const handleUserClick = useCallback((email) => {
    navigate(`/profile/${email}`);
    onClose();
  }, [navigate, onClose]);

  const renderMedia = () => {
    if (!post) return null;

    switch (post.content_type?.toLowerCase()) {
      case 'image':
        return (
          <img 
            src={post.url} 
            alt={post.caption || "Post content"}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              display: 'block'
            }}
          />
        );
      case 'video':
        return (
          <video 
            src={post.url}
            controls
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              display: 'block'
            }}
          />
        );
      case 'audio':
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '20px'
          }}>
            <img 
              src={post.thumbnail || "/disk.jpg"} 
              alt="Audio thumbnail"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            />
            <audio 
              src={post.url} 
              controls 
              style={{ width: '80%' }}
            />
          </div>
        );
      default:
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            Unsupported content type
          </div>
        );
    }
  };

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={e => e.stopPropagation()}>
        <LeftSection>
          {renderMedia()}
        </LeftSection>
        
        <RightSection>
          <Header>
            <UserInfo onClick={() => handleUserClick(post.user_email)}>
              <ProfileImage 
                src={post.user?.profileImage || '/default-profile.png'} 
                alt={post.user?.username || "User"}
              />
              <Username>{post.user?.username || post.username || "User"}</Username>
            </UserInfo>
            
            <OptionsButton onClick={() => setShowOptions(!showOptions)}>
              <FaEllipsisH />
            </OptionsButton>
            
            {showOptions && (
              <OptionsMenu>
                {isCurrentUser ? (
                  <>
                    <OptionItem onClick={handleDelete} isDelete>Delete Post</OptionItem>
                    <OptionItem onClick={() => handleUserClick(post.user_email)}>
                      View Account Info
                    </OptionItem>
                  </>
                ) : (
                  <OptionItem onClick={() => handleUserClick(post.user_email)}>
                    View Account Info
                  </OptionItem>
                )}
                <OptionItem onClick={() => setShowOptions(false)}>Cancel</OptionItem>
              </OptionsMenu>
            )}
          </Header>

          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(100% - 60px)', // Subtract header height
            overflowY: 'auto'
          }}>
            {post.caption && (
              <div style={{ 
                padding: '14px 16px', 
                borderBottom: '1px solid #efefef'
              }}>
                <strong style={{ marginRight: '8px' }}>
                  {post.user?.username || post.username || "User"}
                </strong>
                {post.caption}
              </div>
            )}
            
            <CommentSection 
              currentpost={currentPost} 
              setCurrentPost={setCurrentPost}
            />
          </div>
        </RightSection>
      </PopupContent>
    </PopupOverlay>
  );
};

export default PostPopup; 