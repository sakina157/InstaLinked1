const express = require("express");
const { register, verifyOTP, login, checkUsernameAvailability, getUser, getUserByEmail } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/check-username/:username", checkUsernameAvailability);
router.get("/users/:userId", getUser);
router.get("/profile/:email", getUserByEmail); // ✅ Now it will work!

module.exports = router;
