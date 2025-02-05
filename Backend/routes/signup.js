const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const User = require('../models/user'); 
require('dotenv').config(); 

// Create a transporter with your email details
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'morawalasakina932@gmail.com', // Your email
    pass: 'kjmn bxum clpk kdre', // Your app password
  },
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !password || password !== confirmPassword) {
      return res.status(400).json({ message: 'Please provide email, password, and ensure passwords match.' });
    }


    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: 'base32',
      step: 300
    });

    console.log('Generated OTP:', otp);


    // Save the OTP temporarily or with the user 
    const newUser = new User({
      email,
      password: hashedPassword,
      otp, // Store OTP temporarily
      otpExpires: Date.now() + 300000 // Expiry time (5 minutes)
      
    });

    await newUser.save();

    // Send Welcome Email
    /*await transporter.sendMail({
      from: 'morawalasakina932@gmail.com',
      to: email,
      subject: 'Welcome to Instalinked!',
      text: 'Thank you for signing up! Begin your journey with Instalinked.'
    });
    */

    // Send OTP Email
    Promise.all([
     transporter.sendMail({
      from: 'morawalasakina932@gmail.com',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${otp}. It will expire in 5 minutes.`
    }),
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Instalinked!',
      text: 'Thank you for signing up! Begin your journey with Instalinked.'
    })
  ]);

    res.status(201).json({ message: 'User registered successfully. Check your email for OTP verification.' });

  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
