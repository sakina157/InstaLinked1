import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate,useLocation  } from 'react-router-dom';


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

    console.log("Selected Personas:", selectedPersonas);
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

      const data = await response.json();
      console.log('Response received:', data);

      if (response.ok) {
        setSuccessMessage(data.message);
        navigate('/content-selection', { state: { email: userEmail } });
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error submitting persona:', error);
      setErrorMessage('Something went wrong.');
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Logo>Instalinked</Logo>
        <Progress>Steps 2/3</Progress>
        <SkipButton onClick={() => navigate('/content-selection')}>Skip</SkipButton>
      </Header>

      <MainContent>
        <Title>Select Your Persona</Title>
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

const SkipButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
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

const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PersonaCard = styled.div`
  background: ${(props) => (props.selected ? '#007bff' : '#fff')};
  border: 1px solid ${(props) => (props.selected ? '#007bff' : '#ddd')};
  color: ${(props) => (props.selected ? '#fff' : '#333')};
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
  font-size: 30px;
  margin-bottom: 10px;
`;

const PersonaName = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
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
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;
