import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const ContentSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || localStorage.getItem('userEmail');

  const [selectedContent, setSelectedContent] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const contentOptions = [
    { name: 'Articles', icon: '📄' },
    { name: 'Songs', icon: '🎵' },
    { name: 'Photographs', icon: '📸' },
    { name: 'Audio Stories', icon: '🎙️' },
    { name: 'Text Stories', icon: '📜' },
    { name: 'Research Papers', icon: '📚' },
    { name: 'Short Videos', icon: '🎥' },
    { name: 'Documented Videos', icon: '📂' },
    { name: 'Music', icon: '🎶' },
    { name: 'Art', icon: '🎨' },
    { name: 'Sculptures', icon: '🗿' },
    { name: 'Monuments', icon: '🏛️' },
    { name: 'Buildings', icon: '🏢' },
    { name: 'Folklores', icon: '📖' },
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
        <Logo>Instalinked</Logo>
        <Progress>Steps 3/3</Progress>
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
              <Icon>{content.icon}</Icon>
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
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 20px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const Progress = styled.div`
  font-size: 14px;
  color: #555;
`;

const MainContent = styled.div`
  text-align: center;
  padding: 20px;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  max-width: 900px;
  margin: 0 auto;
`;

const ContentCard = styled.div`
  background: ${(props) => (props.selected ? '#007bff' : '#fff')};
  border: 2px solid ${(props) => (props.selected ? '#007bff' : '#ddd')};
  color: ${(props) => (props.selected ? '#fff' : '#333')};
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;

const Icon = styled.div`
  font-size: 30px;
  margin-bottom: 10px;
`;

const ContentName = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 15px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 15px;
`;

const NextButton = styled.button`
  margin-top: 20px;
  padding: 12px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;
