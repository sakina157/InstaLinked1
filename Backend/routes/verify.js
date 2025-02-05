const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'morawalasakina932@gmail.com',
    pass: 'kjmn bxum clpk kdre',
  },
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    console.log('Received OTP:', otp);
    console.log('Stored OTP:', user.otp);

    // Check if OTP is expired
    if (Date.now() > user.otpExpires) {
      await User.deleteOne({ email });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

     // Compare the stored OTP with user input
     if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Mark user as verified and remove OTP from DB
    await User.updateOne({ email }, { 
      $set: { isVerified: true }, 
      $unset: { otp: "", otpExpires: "" } 
    });

    // Send Welcome Email
     transporter.sendMail({
      from: 'morawalasakina932@gmail.com',
      to: email,
      subject: 'Welcome to Instalinked!',
      text: 'Thank you for signing up! Begin your journey with Instalinked.',
    }, (err, info) => {
      if (err) console.error('Error sending email:', err);
      else console.log('Welcome email sent:', info.response);
    });
    

    res.status(200).json({ message: 'OTP verified successfully. Your account is now active.' });

  } catch (error) {
    console.error('Error during OTP verification:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
