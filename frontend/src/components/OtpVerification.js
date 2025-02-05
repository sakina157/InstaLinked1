import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection

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
        navigate('/persona-selection', { state: { email } });

        
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
    <div>
      <h2>OTP Verification</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={handleResendOtp}>Resend OTP</button>
    </div>
  );
};

export default OtpVerification;
