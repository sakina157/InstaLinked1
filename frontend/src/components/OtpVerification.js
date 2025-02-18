import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styled from 'styled-components';
import logo from "../images/logo.svg";

const OtpVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5500/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        // Redirect to login page after successful verification
        navigate('/your-name', { state: { email } });

        
      }
    } catch (error) {
      setMessage('Error verifying OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5500/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error resending OTP. Please try again.');
    }
  };

  return (
    <Container>
      <Navbar>
        <Logo src={logo} alt="InstaLinked Logo" />
      </Navbar>
      <FormWrapper>
      <Title>OTP Verification</Title>
      
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button type="submit">Verify OTP</Button>
      </Form>
      {message && <Message>{message}</Message>}
      <ResendButton onClick={handleResendOtp}>Resend OTP</ResendButton>
      </FormWrapper>
    </Container>
  );
};

export default OtpVerification;

// Styled Components
const Container = styled.div`
display: flex;
flex-direction: column;
align-items: center;
height: 100vh;
background: #f8f8f8;
`;

const Navbar = styled.div`
width: 100%;
height: 10vh;
display: flex;
align-items: center;
justify-content: flex-start;
background-color: #006d77;
box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
padding: 0px 30px;
`;

const Logo = styled.img`
height: 20vh;
position: relative;
align-self: center;
`;

const FormWrapper = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
  margin-top: 40px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const Button = styled.button`
  background-color: #006d77;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #005a66;
  }
`;

const Message = styled.p`
  margin-top: 10px;
  color: #d9534f;
  font-size: 14px;
`;

const ResendButton = styled.button`
  margin-top: 15px;
  background: none;
  border: none;
  color: #006d77;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;