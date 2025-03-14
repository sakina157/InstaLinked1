const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'your-folder-name', // Specify the folder where files should be stored
    allowed_formats: ['jpg', 'png', 'jpeg','mp4','pdf'],
    resource_type: 'auto', // Allowed file formats
  },
});
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true); // Accept video files
      console.log(file.mimetype); 
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept image files
    } else {
      cb(new Error('Invalid file type! Only images and videos are allowed.'));
    }
  }, });

  const createProfile = async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      console.log("Request File:", req.file);
  
      const { fullName, bio, phone, dateOfBirth, gender, location, occupation, personas, contentPreferences, externalLinks, email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      // Handle profile image
      const profileImagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;
  
      // Find existing user by email
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update fields only if a new value is provided
      if (fullName != null) existingUser.fullName = fullName;
      if (profileImagePath != null) existingUser.profileImage = profileImagePath;
      if (bio != null) existingUser.bio = bio;
      if (phone != null) existingUser.phone = phone;
      if (dateOfBirth != null) existingUser.dateOfBirth = new Date(dateOfBirth);
      if (gender != null) existingUser.gender = gender;
      if (location != null) existingUser.location = location;
      if (occupation != null) existingUser.occupation = occupation;
  
      // Update personas and contentPreferences (convert to arrays if provided)
      if (personas != null) {
        existingUser.persona = Array.isArray(personas) ? personas : personas.split(",").map(p => p.trim());
      }
      if (contentPreferences != null) {
        existingUser.contentPreferences = Array.isArray(contentPreferences)
          ? contentPreferences
          : contentPreferences.split(",").map(p => p.trim());
      }
  
      // Update external links (ensure valid JSON)
      if (externalLinks != null) {
        existingUser.externalLinks = JSON.parse(externalLinks);
      }
  
      // Save the updated profile
      await existingUser.save();
  
      res.status(200).json({
        message: "Profile updated successfully",
        user: existingUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  
  
const getUser = async(req,res) => {
  try {
    const users = await User.find();
    console.log(users) // Fetch all users
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }

}


module.exports = {
  createProfile,
  upload,
  getUser
};