const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Verify configuration values
console.log("Cloudinary Configuration Check:", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY?.substring(0, 5) + "...", // Log partial API key for security
  configured: !!process.env.CLOUD_NAME && !!process.env.API_KEY && !!process.env.API_SECRET
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true // Force HTTPS
});

module.exports = cloudinary;
