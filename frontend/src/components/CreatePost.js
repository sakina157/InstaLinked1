import React, { useState } from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const contentTypes = {
  Image: "image/*",
  Reel: "video/*",
  Audio: "audio/*",
  Pdf: ".pdf,.doc,.docx",
  Documentary:"video/*"
};

const categories = {
  Heritage: "Heritage",
  Research: "Research",
  Art: "Art",
  Music: "Music",
  Story: "Story",
};

const CreatePost = () => {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState("Image");
  const [selectedCategory, setSelectedCategory] = useState("Heritage");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [error, setError] = useState("");

  const user = localStorage.getItem("user");
  const userObject = JSON.parse(user);
  console.log("User Email:", userObject.email);

  const handlePublish = async () => {
    if (!file) {
      alert("Please upload a file before publishing!");
      return;
    }

    // Client-side validation
  if (file.size > 25 * 1024 * 1024) {
    alert("File size exceeds 25MB limit!");
    return;
  }

    const formData = new FormData();
    formData.append("email", userObject.email);
    formData.append("file", file);
    formData.append("caption", caption);
    formData.append("tags", tags);
    formData.append("hashtags", hashtags);
    formData.append("visibility", visibility);
    formData.append("type", selectedType);
    formData.append("category", selectedCategory);

    console.log("📂 FormData Contents before sending request:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
    
    const response = await axios.post("http://localhost:5500/api/create-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        alert("Post published successfully!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Full error:", {
        response: error.response,
        request: error.request,
        message: error.message
      });
  
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          "Failed to publish post";
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: contentTypes[selectedType],
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validTypes = contentTypes[selectedType].split(",");
        
        if (!validTypes.some((type) => file.type.startsWith(type.replace("/*", "")))) {
          setError(`Invalid file type selected. Only ${selectedType} files are allowed!`);
          setFile(null);
          return;
        }

        setFile(file);
        setPreviewURL(URL.createObjectURL(file));
        setError("");
      }
    },
  });

  const handleReset = () => {
    setFile(null);
    setPreviewURL("");
    setCaption("");
    setTags("");
    setHashtags("");
    setVisibility("Public");
  };

  return (
    <Container>
      <Header><span>Create New Post</span>
      <CloseButton onClick={() => navigate("/Home")}>X</CloseButton></Header>
      

      <Content>
        <LeftSection>
          <Title>Create New Post</Title>


          <label>Select post type</label>
          <ButtonGroup>
            {Object.keys(contentTypes).map((type) => (
              <ContentTypeButton key={type} active={selectedType === type} onClick={() => setSelectedType(type)}>
                {type}
              </ContentTypeButton>
            ))}
          </ButtonGroup>

          <label>Select post category</label>
          <ButtonGroup>
            {Object.keys(categories).map((cat) => (
              <ContentTypeButton key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </ContentTypeButton>
            ))}
          </ButtonGroup>

          <Dropzone {...getRootProps()}>
            <input {...getInputProps()} />
            {previewURL ? <PreviewImage src={previewURL} alt="Preview" /> : <p>Drag & Drop or Click to Select {selectedType}</p>}
          </Dropzone>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <TextArea placeholder="Write your caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          <Input type="text" placeholder="Tag people" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Input type="text" placeholder="Add hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />

          <Button primary onClick={handlePublish}>Publish</Button>
          <Button danger onClick={handleReset}>Reset</Button>
        </LeftSection>

        {/* Right Section */}
        <RightSection>
          <Title>Preview</Title>
          <PreviewCard>
            <UserInfo>
              <Avatar>👤</Avatar>
              <div>
                <strong>Sarah Johnson</strong>
                <p>UX Designer • 2h</p>
              </div>
            </UserInfo>
            <p>{caption || "Your caption will appear here..."}</p>
            {file && <PreviewImage src={file} alt="Post Preview" />}
            <Engagement>
              ❤️ 2.4k | 💬 148 | 🔗 Share
            </Engagement>
          </PreviewCard>

          <Title>Recent Posts</Title>
          <RecentPost>
            <PostIcon>🖼️</PostIcon>
            <div>
              <p>Sample image post</p>
              <small>2 hours ago • ❤️ 24 • 💬 8</small>
            </div>
          </RecentPost>
          <RecentPost>
            <PostIcon>🎥</PostIcon>
            <div>
              <p>Sample video post</p>
              <small>5 hours ago • ❤️ 42 • 💬 212</small>
            </div>
          </RecentPost>
          <RecentPost>
            <PostIcon>🎵</PostIcon>
            <div>
              <p>Sample audio post</p>
              <small>8 hours ago • ❤️ 18 • 💬 5</small>
            </div>
          </RecentPost>
        </RightSection>
      </Content>
    </Container>
  );
};

export default CreatePost;
const Container = styled.div`
  width: 75%;
  height:90vh;
  margin: 20px auto;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
`;

const Header = styled.h2`
  text-align: center;
  display:flex;
  justify-content:space-between;
  background: #116466;
  color: white;
  padding: 10px;
  border-radius: 5px;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const LeftSection = styled.div`
  width: 45%;
  background: white;
  position:relative;
  padding: 20px;
  height:90%;
  border-radius: 10px;
`;

const RightSection = styled.div`
  width: 45%;
  background: white;
  padding: 20px;
  border-radius: 10px;
`;

const Title = styled.h3`
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 15px;
  gap:2%
  
`;

const ContentTypeButton = styled.button`
flex:1;
  padding: 8px 15px;
  background: ${(props) => (props.active ? "#116466" : "#ddd")};
  color: ${(props) => (props.active ? "white" : "black")};
  border: none;

  border-radius: 5px;
  cursor: pointer;
`;

const Dropzone = styled.div`
  
  padding: 20px;
  background-color:#dddddd;
  text-align: center;
  justify-content:center;
  cursor: pointer;
  position:relative;
  height:100%;
  height:25vh;
  border-radius: 5px;
  margin-bottom: 15px;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%; 
  object-fit: cover;
  border-radius: 2px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 10vh;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  background: ${(props) => (props.primary ? "#116466" : props.danger ? "#ff4d4d" : props.secondary ? "#777" : "#ccc")};
  color: white;
  padding: 10px;
  margin-right: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const RecentPost = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const PostIcon = styled.div`
  font-size: 24px;
  margin-right: 10px;
`;
const PreviewCard = styled.div`
  background: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Avatar = styled.div`
  font-size: 24px;
  margin-right: 10px;
`;

const Engagement = styled.div`
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
`;
