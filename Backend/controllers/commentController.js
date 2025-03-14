const Post = require("../models/post");


// Add comment to a post
const addCommentToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ userId, text, createdAt: new Date() });
    await post.save();
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add comment to a reel
const addCommentToReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { userId, text } = req.body;
    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    reel.comments.push({ userId, text, createdAt: new Date() });
    await reel.save();
    res.json(reel.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { addCommentToPost, addCommentToReel };
