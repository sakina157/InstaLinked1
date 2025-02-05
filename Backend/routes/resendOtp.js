const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const User = require('../models/user'); // Adjust the path as necessary
const nodemailer = require('nodemailer');

// Reuse your existing transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'morawalasakina932@gmail.com', // Your email
    pass: 'kjmn bxum clpk kdre', // Your app password
  },
});

router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET || 'your-secret-key', // Use a secure secret key
      encoding: 'base32',
      step: 300 //  (5 minutes)
    });

    // Send OTP Email
    const otpMailOptions = {
      from: 'morawalasakina932@gmail.com', 
      to: email,
      subject: 'Your New Verification Code',
      text: `Your new verification code is ${otp}.`,
    };

    await transporter.sendMail(otpMailOptions);

    res.status(200).json({ message: 'New OTP sent successfully.' });
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ message: 'Error resending OTP. Please try again.' });
  }
});

module.exports = router;
