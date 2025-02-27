import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/logo.svg';
import { FaFileAlt, FaMusic, FaCamera, FaMicrophone, FaBook, FaFilePdf, FaFilm, FaVideo, FaPaintBrush, FaMonument, FaBuilding, FaLandmark, FaGlobe } from 'react-icons/fa';

const ContentSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || localStorage.getItem('userEmail');

  const [selectedContent, setSelectedContent] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const contentOptions = [
    { name: 'Articles', icon: <FaFileAlt /> },
    { name: 'Songs', icon: <FaMusic /> },
    { name: 'Photographs', icon: <FaCamera /> },
    { name: 'Audio Stories', icon: <FaMicrophone /> },
    { name: 'Text Stories', icon: <FaBook /> },
    { name: 'Research Papers', icon: <FaFilePdf /> },
    { name: 'Short Videos', icon: <FaFilm /> },
    { name: 'Documented Videos', icon: <FaVideo /> },
    { name: 'Music', icon: <FaMusic /> },
    { name: 'Art', icon: <FaPaintBrush /> },
    { name: 'Sculptures', icon: <FaMonument /> },
    { name: 'Monuments', icon: <FaLandmark /> },
    { name: 'Buildings', icon: <FaBuilding /> },
    { name: 'Folklores', icon: <FaGlobe /> },
  ];
  
  const handleContentSelect = (content) => {
    setSelectedContent((prev) =>
      prev.includes(content) ? prev.filter((c) => c !== content) : [...prev, content]
    );
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      setErrorMessage('User email is missing! Please log in again.');
      return;
    }
    if (selectedContent.length === 0) {
      setErrorMessage('Please select at least one content type.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5500/api/content-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, contentPreferences: selectedContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        navigate('/login');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error submitting content selection:', error);
      setErrorMessage('Something went wrong.');
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Logo src={logo} alt="InstaLinked Logo" />
        <Progress>Steps 3/3</Progress>
        <SkipButton onClick={() => navigate('/Login')}>Skip ➝</SkipButton>
      </Header>

      <MainContent>
        <Title>Customize Your Feed</Title>
        <Description>Select the types of content you want to explore.</Description>

        <ContentGrid>
          {contentOptions.map((content) => (
            <ContentCard
              key={content.name}
              selected={selectedContent.includes(content.name)}
              onClick={() => handleContentSelect(content.name)}
            >
              <Icon selected={selectedContent.includes(content.name)}>
                {content.icon}</Icon>
              <ContentName>{content.name}</ContentName>
            </ContentCard>
          ))}
        </ContentGrid>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

        <NextButton onClick={handleSubmit}>Finish →</NextButton>
      </MainContent>
    </PageWrapper>
  );
};

export default ContentSelection;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height:100%;
  gap:40px;
  background: #f5f3ee;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height:8vh;
  padding: 15px 30px;
  background:#006D77;
  color: white;
  font-weight: bold;
`;

const Logo = styled.img`
  width: 160px; /* Increased size */
  height: 20vh;
  object-fit: contain;
`;
const Progress = styled.div`font-size: 16px;`;
const SkipButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
`;

const MainContent = styled.div`
  position:relative;
  height:100%;
  text-align: center;
  gap:40px;
  padding: 40px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
`;


const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: auto;
`;
const ContentCard = styled.div`
  background: ${(props) => (props.selected ?'#80b6bb' : 'white')};
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Icon = styled.div`
   font-size: 30px;
  margin-bottom: 10px;
  color: ${(props) => (props.selected ? 'white' : '#004d40')};
  transition: color 0.3s ease;
`;


const ContentName = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;


const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 15px;
`;

const NextButton = styled.button`
  margin-top: 30px;
  margin-bottom:40%;
  padding: 12px 24px;
  font-size: 16px;
  background-color: #006D77;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background-color: #00332e;
  }
`;