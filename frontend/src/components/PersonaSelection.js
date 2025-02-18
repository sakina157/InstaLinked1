import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate,useLocation  } from 'react-router-dom';
import logo from '../images/Artboard 1.svg';

const PersonaSelection = ( ) => {
  

  const navigate = useNavigate();
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const personas = ['Heritage Lover', 'Explorer', 'Researcher', 'Practitioner', 'Conservator', 'Artist'];
  
  
  const location = useLocation();
  const userEmail = location.state?.email || localStorage.getItem('userEmail');


  console.log("🚀 Final User Email used:", userEmail);

  // Allow users to select up to 3 personas
  const handlePersonaSelect = (persona) => {
    if (selectedPersonas.includes(persona)) {
      setSelectedPersonas((prev) => prev.filter((p) => p !== persona));
    } else if (selectedPersonas.length < 3) {
      setSelectedPersonas((prev) => [...prev, persona]);
    }

    console.log("Selected Personas:", [...selectedPersonas]);
  };

  const handleSubmit = async () => {
    
    console.log("📤 Attempting to send:", { userEmail, persona: selectedPersonas });
  
    if (!userEmail) {
      setErrorMessage("User email is missing! Please log in again.");
      return;
    }
    if (selectedPersonas.length === 0) {
      setErrorMessage('Please select at least one persona.');
      return;
    }
  
    console.log("✅ Sending request with email:", userEmail);


    try {
      const response = await fetch('http://localhost:5500/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, persona: selectedPersonas }),
      });

      console.log("🛠 Raw response status:", response.status);
    const text = await response.text();  // Read raw response
    console.log("🛠 Raw response body:", text);

    try {
      const data = JSON.parse(text); // Convert to JSON
      console.log("Response received:", data);

      if (response.ok) {
        setSuccessMessage(data.message);
        navigate("/content-selection", { state: { email: userEmail } });
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("❌ Failed to parse JSON:", text);
      setErrorMessage("Something went wrong. Server response was not JSON.");
    }
  } catch (error) {
    console.error("Error submitting persona:", error);
    setErrorMessage("Something went wrong.");
  }
};

  return (
    <PageWrapper>
      <Header>
        <Logo><img src={logo} alt="InstaLinked Logo" style={{ height: '25px' }} /></Logo>
        <Progress>Steps 2/3</Progress>
        
      </Header>

      <MainContent>
        <TitleWrapper>
        <Title>Select Your Persona</Title>
        <SkipButton onClick={() => navigate('/content-selection')}>Skip</SkipButton>
        </TitleWrapper>

        <Description>
          Tell us who you are to tailor your experience on the Instalinked platform.
        </Description>

        <PersonaGrid>
          {personas.map((persona) => (
            <PersonaCard
              key={persona}
              selected={selectedPersonas.includes(persona)}
              onClick={() => handlePersonaSelect(persona)}
            >
              <Icon>👤</Icon>
              <PersonaName>{persona}</PersonaName>
              <PersonaDescription>
                {persona === 'Heritage Lover' &&
                  'Someone passionate about preserving cultural heritage.'}
                {persona === 'Explorer' &&
                  'A wanderer curious about new places, stories, and cultures.'}
                {persona === 'Researcher' &&
                  'A professional involved in cultural research and studies.'}
                {persona === 'Practitioner' &&
                  'A specialist dedicated to cultural practices and traditions.'}
                {persona === 'Conservator' &&
                  'A professional focused on preserving historical and cultural items.'}
                {persona === 'Artist' &&
                  'A creative individual inspired by cultural heritage.'}
              </PersonaDescription>
            </PersonaCard>
          ))}
        </PersonaGrid>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

        <NextButton onClick={handleSubmit}>Next →</NextButton>
      </MainContent>
    </PageWrapper>
  );
};

export default PersonaSelection;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f4f2ee;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 10px 0;
  
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #006d77;
  img {
    height: 20px; 
    width: auto;
`;

const Progress = styled.div`
  font-size: 18px;
  color: #555;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
`;
const TitleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #006d77;
  align-font: center;
`;

const SkipButton = styled.button`
  position: absolute;
  right: 0;
  background: none;
  border: none;
  color: #006d77;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
`;

const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 20px; // Space between cards
  width: 100%;
  max-width: 1000px;
  margin: 0 auto; 
`;

const PersonaCard = styled.div`
  background: ${(props) => (props.selected ? '#006d77' : '#ffffff')};
  border: 1px solid ${(props) => (props.selected ? '#006d77' : '#ddd')};
  color: ${(props) => (props.selected ? '#ffffff' : '#333')};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;

const Icon = styled.div`
  font-size: 25px;
  margin-bottom: 10px;
`;

const PersonaName = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const PersonaDescription = styled.p`
  font-size: 14px;
  color: ${(props) => (props.selected ? '#ffffff' : '#555')};
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 20px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 20px;
`;

const NextButton = styled.button`
  margin-top: 30px;
  padding: 12px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #006d77;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #004d55;
  }
`;