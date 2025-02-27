import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUniversity, FaGlobe, FaFlask, FaTools, FaHeart, FaPalette } from 'react-icons/fa';
import logo from '../images/logo.svg';


const PersonaSelection = () => {
  const navigate = useNavigate();
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const userEmail = location.state?.email || localStorage.getItem('userEmail');
  const username = location.state?.username;

  const personas = [
    { name: 'Heritage Lover', icon: <FaUniversity /> },
    { name: 'Explorer', icon: <FaGlobe /> },
    { name: 'Researcher', icon: <FaFlask /> },
    { name: 'Practitioner', icon: <FaTools /> },
    { name: 'Conservator', icon: <FaHeart /> },
    { name: 'Artist', icon: <FaPalette /> },
  ];

  const handlePersonaSelect = (persona) => {
    
    if (selectedPersonas.includes(persona)) {
      setSelectedPersonas((prev) => prev.filter((p) => p !== persona));
    } else if (selectedPersonas.length < 3) {
      setSelectedPersonas((prev) => [...prev, persona]);
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting persona:", { email: userEmail, persona: selectedPersonas, username });
  
    if (!userEmail) {
      setErrorMessage("User email is missing! Please log in again.");
      return;
    }
  
    if (selectedPersonas.length === 0) {
      setErrorMessage("Please select at least one persona.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5500/api/persona", {
        email: userEmail,
        persona: selectedPersonas,
        username,
      });

  
      console.log("Persona submission response:", response.data);
  
      if (response.status === 200) {
        navigate("/content-selection", { state: { email: userEmail } });
      } else {
        setErrorMessage( "Something went wrong.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
      console.error(error);
    }
  };

  return (
    <Container>
      <Header>
        <Logo src={logo} alt="InstaLinked Logo" />
        <Progress>Steps 2/3</Progress>
        <SkipButton onClick={() => navigate('/content-selection')}>Skip ➝</SkipButton>
      </Header>
      <Main>
        <Title>Select Your Persona</Title>
        <Description>Tell us who you are to tailor your experience on the platform.</Description>
        <PersonaGrid>
          {personas.map((persona) => (
            <PersonaCard
              key={persona.name}
              selected={selectedPersonas.includes(persona.name)}
              onClick={() => handlePersonaSelect(persona.name)}
            >
              <Icon selected={selectedPersonas.includes(persona.name)}>{persona.icon}</Icon>
              <PersonaName>{persona.name}</PersonaName>
              <PersonaDesc selected={selectedPersonas.includes(persona.name)}>
                {persona.name === 'Heritage Lover' && 'Discovering and preserving cultural heritage.'}
                {persona.name === 'Explorer' && 'Curious about new places, stories, and artifacts.'}
                {persona.name === 'Researcher' && 'Enjoys delving into historical or cultural studies.'}
                {persona.name === 'Practitioner' && 'Involved in cultural practices or conservation efforts.'}
                {persona.name === 'Conservator' && 'Dedicated to preserving historical and cultural items.'}
                {persona.name === 'Artist' && 'Looking to share or explore art forms.'}
              </PersonaDesc>
            </PersonaCard>
          ))}
        </PersonaGrid>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <NextButton onClick={handleSubmit}>Next ➝</NextButton>
      </Main>
    </Container>
  );
};

export default PersonaSelection;

const Container = styled.div`
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

const Main = styled.div`
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

const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: auto;
`;

const PersonaCard = styled.div`
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
  color: ${(props) => (props.selected ? '#E5E5E5' : '#004d40')};
`;

const PersonaName = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;

const PersonaDesc = styled.p`
  font-size: 14px;
  color: ${(props) => (props.selected ? '#E5E5E5' : '#555')};
  margin-top: 5px;
`;
const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
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