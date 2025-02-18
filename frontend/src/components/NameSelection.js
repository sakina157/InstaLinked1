import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const NameSelection = () => {
  const [username, setUsername] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) {
      setError("No email found. Please restart signup.");
    }
  }, [email]);

  // ✅ Check username availability
  const checkUsernameAvailability = async (username) => {
    console.log("🔍 Checking username:", username); // Debugging
  
    if (!username || typeof username !== "string") {
      console.error("❌ Invalid input: username is not a string", username);
      setError("Invalid username. Please enter a valid name.");
      return;
    }
  
    username = username.trim();
    console.log("✅ Trimmed username:", username);

    if (!username) {
      setError("Invalid username. Please enter a valid name.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5500/api/persona/check-username/${encodeURIComponent(username)}`
      );

      console.log("Username Check Response:", response.data); // Debugging

      if (response.data.exists) {
        setIsAvailable(false);
        setError("Username already exists. Please choose a different name.");
      } else {
        setIsAvailable(true);
        setError(""); // Reset error if available
      }
    } catch (err) {
      setError("Error checking username. Please try again.");
      console.error("Username check error:", err);
    }
    setLoading(false);
};


  // ✅ Handle username submission
  const handleSubmit = async () => {
    if (!username.trim()) {
        setError("Please enter a username.");
        return;
    }

    if (!isAvailable) {
        setError("Username is already taken. Choose another one.");
        return;
    }

    setLoading(true);
    try {
        const saveResponse = await axios.post(
            "http://localhost:5500/api/persona/set-username",
            { username, email }
        );

        if (saveResponse.status === 200) {
            // ✅ Store username in LocalStorage
            localStorage.setItem("userUsername", username);

            // ✅ Navigate to Persona Selection
            navigate("/persona-selection", { state: { email, username } });
        } else {
            setError("Failed to save username. Please try again.");
        }
    } catch (err) {
        setError("Something went wrong. Please try again.");
        console.error("Error setting username:", err);
    }
    setLoading(false);
};


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Choose Your Username</h2>
      <p style={styles.subtitle}>What would you like to be known as?</p>

      <input
  type="text"
  value={username}
  onChange={(e) => {
    setUsername(e.target.value);
    console.log("✍️ Typing username:", e.target.value); // Debugging
  }}
  onBlur={() => checkUsernameAvailability(username)} // Call function when focus leaves
  placeholder="Enter your username"
        style={styles.inputField}
      />

      {loading && <p style={styles.loading}>Checking...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {isAvailable && <p style={styles.success}>Username available ✅</p>}

      <button onClick={handleSubmit} style={styles.submitButton} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>
    </div>
  );
};

export default NameSelection;

// ✅ Styled Components
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f2ee",
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#006d77",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#444",
    marginBottom: "10px",
  },
  inputField: {
    width: "300px",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    marginBottom: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
  success: {
    color: "green",
    fontSize: "14px",
    marginBottom: "10px",
  },
  loading: {
    color: "#006d77",
    fontSize: "14px",
    marginBottom: "10px",
  },
  submitButton: {
    padding: "12px 20px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#006d77",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
