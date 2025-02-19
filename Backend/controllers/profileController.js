const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');


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
  
      const { fullname, bio, phone, dateOfBirth, gender, location, occupation, personas, contentPreferences, externalLinks, email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      // Profile image handling
      const profileImagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;
  
      
  
      // Find user by email
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update user profile fields
      if (fullname) existingUser.fullName = fullname;
      if (profileImagePath) existingUser.profileImage = profileImagePath;
      if (bio) existingUser.bio = bio;
      if (phone) existingUser.phone = phone;
      if (dateOfBirth) existingUser.dateOfBirth = new Date(dateOfBirth);
      if (gender) existingUser.gender = gender;
      if (location) existingUser.location = location;
      if (occupation) existingUser.occupation = occupation;
      if (personas) existingUser.persona = personas;
      if (contentPreferences) existingUser.contentPreferences = contentPreferences;
      if (externalLinks) existingUser.externalLinks = JSON.parse(externalLinks);
  
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




module.exports = {
  createProfile,
  upload,
 
};