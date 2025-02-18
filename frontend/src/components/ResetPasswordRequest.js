import React, { useState } from "react";
import axios from "axios";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message,setMessage]=useState("")

  const handleRequest = async (e) => {
    e.preventDefault();
    setMessage("")
    try {
      await axios.post("api/auth/reset-password-request", { email });
      setMessage("Reset link send to your email")
    } catch (error) {
      alert(error.response.data.message || "Failed to send reset email!");
    }
  };

  return (
    <form onSubmit={handleRequest}>
      <h2>Reset Password</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Send Reset Email</button>
      <h4>{message}</h4>
    </form>
  );
};

export default ResetPasswordRequest;