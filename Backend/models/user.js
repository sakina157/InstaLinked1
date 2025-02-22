const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String },
    profileImage: { type: String },
    bio: { type: String },
    phone: { type: String},
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    location: { type: String },
    occupation: { type: String },
    externalLinks: { type: [String] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    username: { type: String, unique: true, sparse: true },
    persona: { type: [String], enum: ['Heritage Lover', 'Explorer', 'Researcher', 'Practitioner', 'Conservator', 'Artist'], default: [] },    
    otp: { type: String }, // Field to store the OTP temporarily
    otpExpires: { type: Date }, // Optional: Field to store OTP expiration time
    isVerified: { type: Boolean, default: false },
    contentPreferences: { type: [String], default: [] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    firebaseUID: { type: String, unique: true }

},  { collection: "users" });

const User = mongoose.model('User', userSchema);

module.exports = User;
