import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import OtpVerification from "./components/OtpVerification";
import PersonaSelection from "./components/PersonaSelection";
import ContentSelection from "./components/ContentSelection";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUser(storedEmail);  // ✅ Use setUser correctly
    }
  }, []);
  
  

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/persona-selection" element={<PersonaSelection userEmail={user} />} />
        <Route path="/content-selection" element={<ContentSelection userEmail={user} />} />
        <Route path="/" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
