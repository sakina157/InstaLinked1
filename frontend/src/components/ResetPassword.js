import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";


const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  const navigate=useNavigate();
  const handleReset = async (e) => {
    if(!newPassword.match(conPassword)){
      alert("password different ")
      return;
    }

    e.preventDefault();
    try {
      await axios.post("api/auth/reset-password", { token, newPassword });
      alert("Password reset successful!");
      navigate('/login')
    } catch (error) {
      alert(error.response.data.message || "Password reset failed!");
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h4>Set New Password</h4>
      <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      <h4>Confirm Password</h4>
      <input type="password" placeholder="Password" value={conPassword} onChange={(e) => setConPassword(e.target.value)} required />
      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPassword;