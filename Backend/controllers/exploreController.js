const Post = require("../models/post");
const User = require("../models/user");

const explorePage = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $unwind: "$posts" }, // Flatten posts array
      {
        $lookup: {
          from: "users", // Collection name in MongoDB
          localField: "user_email",
          foreignField: "email",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" }, // Convert userDetails array to object
      {
        $project: {
          _id: "$posts._id",
          url: "$posts.url",
          caption: "$posts.caption",
          content_type: "$posts.content_type",
          category: "$posts.category",
          hashtags: "$posts.hashtags",
          tags: "$posts.tags",
          visibility: "$posts.visibility",
          created_at: "$posts.created_at",
          // User details
          user: {
            fullName: "$userDetails.fullName",
            profileImage: "$userDetails.profileImage",
            bio: "$userDetails.bio",
            location: "$userDetails.location",
            occupation: "$userDetails.occupation",
            persona: "$userDetails.persona",
          },
        },
      },
      { $sample: { size: 120 } }, // Random selection of 120 posts
    ]);

    // Separate PDFs and reels from other content
    const mediaPosts = posts.filter(
      (post) => post.content_type === "pdf" || post.content_type.startsWith("reel")
    );
    const otherPosts = posts.filter(
      (post) => !(post.content_type === "pdf" || post.content_type.startsWith("reel"))
    );

    let finalPosts = [];
    let mediaIndex = 0,
      otherIndex = 0;
    let lastMediaIndex = -9; // Ensures a gap of 9 posts between media posts

    while (mediaIndex < mediaPosts.length || otherIndex < otherPosts.length) {
      let row = []; // Dynamic row

      // Add a media post if the 10-post gap is satisfied
      if (mediaIndex < mediaPosts.length && finalPosts.length - lastMediaIndex >= 10) {
        let mediaPost = mediaPosts[mediaIndex++];
        if (Math.random() < 0.5) {
          row.push(mediaPost); // First column
        } else {
          row.unshift(mediaPost); // Last column
        }
        lastMediaIndex = finalPosts.length;
      }

      // Fill the rest of the row with other posts
      while (row.length < 3 && otherIndex < otherPosts.length) {
        row.push(otherPosts[otherIndex++]);
      }

      finalPosts.push(...row.filter(Boolean)); // Remove null values
    }
    console.log(finalPosts)
    res.status(200).json(finalPosts);
  } catch (error) {
    console.error("Error fetching explore page data:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { explorePage };