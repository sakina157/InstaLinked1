import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import OtpVerification from "./components/OtpVerification";
import NameSelection from "./components/NameSelection";
import PersonaSelection from "./components/PersonaSelection";
import ContentSelection from "./components/ContentSelection";
import Login from "./components/Login";
import ResetPasswordRequest from "./components/ResetPasswordRequest";
import ResetPassword from "./components/ResetPassword";
import HomePage from "./components/HomePage";  
import CreatePost from "./components/CreatePost";
import ViewProfile from "./components/ViewProfile";
import CreateProfile from "./components/CreateProfile";
import Navbar from "./components/Navbar";


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));  // Store full user object instead of just email
    }
  }, []);

  return (
    <Router>
      {/* Show Navbar only for Signup and Login */}
      <Routes>
        <Route path="/"element={
            <>
              <Navbar />
              <Signup />
            </>
          }
        />
        <Route path="/login" element={
            <>
              <Navbar />
              <Login />
            </>
          }
        />
      </Routes>

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/your-name" element={<NameSelection />} />
        <Route path="/persona-selection" element={<PersonaSelection userEmail={user} />} />
        <Route path="/content-selection" element={<ContentSelection userEmail={user} />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/home" element={<HomePage />} /> 
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/profile/:userId" element={<ViewProfile />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        
      </Routes>
    </Router>
  );
}

export default App;
