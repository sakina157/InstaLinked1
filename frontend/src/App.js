import React from 'react';
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation  } from "react-router-dom";
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
import HomeNavbar from "./components/HomeNavbar";
import Explore from "./components/Explore"
import PopUPexplore from "./components/PopUPexplore";
import { SocketProvider } from './context/SocketContext';
import Notification from './components/Notification';


function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));  // Store full user object instead of just email
    }
  }, []);

  return (
    <SocketProvider>
      <Router>
        <LocationProvider user={user}/>
      </Router>
    </SocketProvider>
  );
}
// ✅ Create a separate component inside Router
function LocationProvider({ user }) {
  const location = useLocation();
  const background = location.state?.background;

  return (
    
    <>
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
        <Route path="/persona-selection" element={<PersonaSelection />} />
        <Route path="/content-selection" element={<ContentSelection userEmail={user} />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/home" element={<HomePage />} /> 
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/profile/:userId" element={<ViewProfile />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/home-navbar" element={<HomeNavbar />} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>

      <Routes location={background || location}>
        <Route path="/explore-page" element={<Explore />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/p/:postId"
            element={
              <PopUPexplore/>
                
            }
          />
        </Routes>
      )}
    </>
  );
}

export default App;
