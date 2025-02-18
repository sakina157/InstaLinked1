const mongoose = require("mongoose");
const User = require("./user"); // Adjust the path to your User model

mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanup() {
  try {
    // Update all users with null fullName
    await User.updateMany(
      { fullName: null },
      { $set: { fullName: "default_name" } }
    );
    console.log("Cleanup complete.");
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    mongoose.connection.close();
  }
}

cleanup();