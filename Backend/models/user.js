const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    persona: { type: [String], enum: ['Heritage Lover', 'Explorer', 'Researcher', 'Practitioner', 'Conservator', 'Artist'], default: null },    
    otp: { type: String }, // Field to store the OTP temporarily
    otpExpires: { type: Date }, // Optional: Field to store OTP expiration time
    isVerified: { type: Boolean, default: false },
    contentPreferences: { type: [String], default: [] },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
