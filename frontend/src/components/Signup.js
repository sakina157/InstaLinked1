import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const { email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await axios.post('http://localhost:5500/api/signup', {
        email,
        password,
        confirmPassword,
      });

      localStorage.setItem("userEmail", email);
      console.log("✅ Email stored in LocalStorage:", email);

      setSuccess('Signup successful! Please check your email for the verification code.');


      // Redirect to OTP verification page
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Logo>Instalinked</Logo>
        <Nav>
          <NavItem>Menu Item 1</NavItem>
          <NavItem>Menu Item 2</NavItem>
          <NavItem>Menu Item 3</NavItem>
          <NavItem>Menu Item 4</NavItem>
          <NavAuth>
            <NavItem>Login</NavItem>
            <NavItem active>Sign Up</NavItem>
          </NavAuth>
        </Nav>
      </Header>
      <Main>
        <Placeholder />
        <FormWrapper>
          <Title>Begin your journey</Title>
          <Form onSubmit={handleSubmit}>
            {/* Email Input */}
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Password Input */}
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Confirm Password Input */}
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {/* Error and Success Messages */}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            {/* Terms and Conditions */}
            <CheckboxWrapper>
              <Checkbox type="checkbox" id="terms" required />
              <CheckboxLabel htmlFor="terms">
                By signing up, I agree with the Terms & Privacy Policy.
              </CheckboxLabel>
            </CheckboxWrapper>

            {/* Submit Button */}
            <SubmitButton type="submit">Register</SubmitButton>
            <LoginLink>
  Already have an account? <span onClick={() => navigate('/login')}>Login</span>
</LoginLink>

          </Form>
        </FormWrapper>
      </Main>
      <Footer>
        <FooterWrapper>
          <FooterLogo>Instalinked</FooterLogo>
          <FooterLinks>
            <FooterLink>Pricing</FooterLink>
            <FooterLink>About us</FooterLink>
            <FooterLink>Features</FooterLink>
            <FooterLink>Help Center</FooterLink>
            <FooterLink>Contact us</FooterLink>
            <FooterLink>FAQs</FooterLink>
            <FooterLink>Careers</FooterLink>
          </FooterLinks>
        </FooterWrapper>
        <Copyright>© 2025 Brand, Inc. • Privacy • Terms • Sitemap</Copyright>
      </Footer>
    </PageWrapper>
  );
};

export default Signup;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f2f5;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #007bff;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavItem = styled.div`
  margin-left: 20px;
  font-size: 16px;
  color: ${(props) => (props.active ? '#007bff' : '#333')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
  cursor: pointer;

  &:hover {
    color: #007bff;
  }
`;

const NavAuth = styled.div`
  display: flex;
  align-items: center;
  margin-left: 40px;
`;

const Main = styled.main`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-grow: 1;
  padding: 50px;
`;

const Placeholder = styled.div`
  width: 400px;
  height: 300px;
  background: #e0e0e0;
  border-radius: 10px;
`;

const FormWrapper = styled.div`
  width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 25px;
  text-align: center;
  font-size: 24px;
  color: #333;
  font-weight: bold;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #555;
`;

const SubmitButton = styled.button`
  padding: 12px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  font-size: 14px;
  margin-bottom: 10px;
`;
const LoginLink = styled.div`
  margin-top: 15px;
  font-size: 14px;
  text-align: center;
  color: #555;

  span {
    color: #007bff;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;


const Footer = styled.footer`
  background: #f8f9fa;
  padding: 30px 15px;
  text-align: center;
`;

const FooterWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const FooterLogo = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

const FooterLink = styled.div`
  font-size: 14px;
  color: #333;
  cursor: pointer;

  &:hover {
    color: #007bff;
  }
`;

const Copyright = styled.div`
  font-size: 14px;
  color: #888;
`;
