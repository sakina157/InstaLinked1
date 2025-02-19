const express = require("express");
const { register, verifyOTP, login, checkUsernameAvailability, getUser, getUserByEmail, loginWithGoogle,  googleSignup } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/check-username/:username", checkUsernameAvailability);
router.get("/users/:userId", getUser);
router.get("/profile/:email", getUserByEmail); 
router.post("/login-google", loginWithGoogle); // ✅ Add Google login route
router.post("/auth/google-signup", googleSignup);


module.exports = router;
