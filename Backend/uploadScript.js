const mongoose = require("mongoose");
const cloudinary = require("./cloudinaryConfig");
const Post = require("./models/post");
const User = require("./models/user");

const samplePosts = [
    {
      text: "Exploring ancient ruins! 🏛️",
      mediaUrl: "https://res.cloudinary.com/demo/image/upload/v1700000000/sample1.jpg",
      category: "Heritage Lover",
      role: "Explorer", // ✅ Added role field
      content: "This is an amazing place!", // ✅ Added content field
    },
    {
      text: "A breathtaking sunset over the mountains! ⛰️🌄",
      mediaUrl: "https://res.cloudinary.com/demo/video/upload/v1700000000/sample2.mp4",
      category: "Explorer",
      role: "Traveler",
      content: "Nature at its best!",
    },
    {
      text: "Restoring a 500-year-old painting! 🖼️",
      mediaUrl: "https://res.cloudinary.com/demo/image/upload/v1700000000/sample3.jpg",
      category: "Conservator",
      role: "Artist",
      content: "Preserving history for the future!",
    },
  ];

async function fetchUsers() {
    try {
        await mongoose.connect("mongodb://localhost:27017/test"); // ✅ Ensure DB connection
        const users = await User.find({}); // ✅ Explicitly fetching all users

        if (!users || users.length === 0) {
            console.log("⚠️ No users found in the database.");
            return [];
        } else {
            console.log(`✅ Found ${users.length} users.`);
            return users;
        }
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        return [];
    }
}

fetchUsers().then(users => {
    console.log("Fetched Users:", users);
}).catch(error => console.error("Fetch Error:", error));


async function uploadRandomPosts() {
  try {
    await mongoose.connect("mongodb://localhost:27017/test");

    const users = await fetchUsers(); // Fetch all users from DB
    if (users.length === 0) {
      console.log("No users found. Add users before running the script.");
      return;
    }

    for (const post of samplePosts) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const newPost = new Post({
        userId: randomUser._id,
        author: randomUser._id, // ✅ Required field
        user_email: randomUser.email,
        text: post.text,
        content: post.content, // ✅ Required field
        role: post.role, // ✅ Required field
        image: post.mediaUrl,
        category: post.category,
        likes: [],
        comments: [],
      });
      await newPost.save();
      console.log(`✅ Uploaded post for ${randomUser.email}`);
    }

    console.log("🎉 Random posts uploaded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error uploading posts:", error);
    process.exit(1);
  }
}

uploadRandomPosts();
