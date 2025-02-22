import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { auth, googleProvider, facebookProvider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import Footer from './Footer';

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

    // ✅ Check password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

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

  const handleGoogleSignup = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        console.log("Google Sign-In Success:", user);

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Send user details to backend
        const backendUrl = "http://localhost:5500/api/auth/signup-google"; 

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firebaseToken: idToken, 
              email: user.email,  
              fullName: user.displayName, 
              profileImage: user.photoURL,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("User stored in backend successfully:", data);

            // ✅ Store user data in localStorage
            const userData = {
                token: data.token,
                _id: data.user._id,
                email: data.user.email,
                username: data.user.username || "New User",
                profileImage: data.user.profileImage || "default_user.jpg"
            };

            localStorage.setItem("user", JSON.stringify(userData));

            // ✅ Navigate to Name Selection page
            navigate("/your-name", { state: { email: user.email } });
        } else {
            console.error("Failed to store user in backend:", data);
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
};

  
  
  const handleFacebookSignup = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log("Facebook Sign-In Success:", result.user);
      // Send user data to backend if needed
    } catch (error) {
      console.error("Facebook Sign-In Error:", error);
    }
  };
  

  return (
    <PageWrapper>
      
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
                By signing up, I agree with the {" "}
                <TermsLink onClick={() => navigate('/terms')}>Terms & Privacy Policy</TermsLink>.
              </CheckboxLabel>
            </CheckboxWrapper>

            {/* Submit Button */}
            <SubmitButton type="submit">Register</SubmitButton>
            <Separator><SeparatorText>Or sign up with</SeparatorText></Separator>
              <OAuthButtons>
              <GoogleButton onClick={handleGoogleSignup} >
              <GoogleLogo 
              src="googleicon.png"
              alt="Google Logo" />
          Sign up with Google
        </GoogleButton>
        <FacebookButton onClick={handleFacebookSignup}>
                <GoogleLogo src="facebookicon.png" alt="Google Logo" />
                Sign up with Facebook
                </FacebookButton>
              </OAuthButtons>
            <LoginLink>
  Already have an account? <span onClick={() => navigate('/login')}>Login</span>
</LoginLink>

          </Form>
        </FormWrapper>
      </Main>
      <Footer/>
      
    </PageWrapper>
  );
};

export default Signup;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f4f2ee;
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
  background: #80b6bb;
  border-radius: 10px;
`;

const FormWrapper = styled.div`
  width: 400px;
  padding: 30px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 25px;
  text-align: center;
  font-size: 24px;
  color: #000000;
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
    border-color: #006d77;
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
const TermsLink = styled.span`
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: #0056b3;
  }
`;


const SubmitButton = styled.button`
  padding: 12px;
  font-size: 16px;
  color: #fff;
  background-color: #006d77;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #004d55;
  }
`;

const OAuthButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const GoogleButton = styled.button`
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  display: flex;
    position: relative;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 10px 15px;
    border: none;
    background-color: #ffffff;
    color: #757575;
    font-size: 13px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;


const FacebookButton = styled.button`
  
  background: white;
  border: 1px solid #ddd;
  display: flex;
    position: relative;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 10px 10px;
    border: none;
    background-color: #ffffff;
    color: #757575;
    font-size: 13px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;
const GoogleLogo =styled.img`
width: 20px;
height: 20px;
margin-right: 10px;`

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

const Separator = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 10px 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #ccc;
    margin: 0 10px;
  }
`;

const SeparatorText = styled.span`
  font-size: 14px;
  color: #555;
  font-weight: 500;
`;

const LoginLink = styled.div`
  margin-top: 15px;
  font-size: 14px;
  text-align: center;
  color: #555;

  span {
    color: #006d77;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;