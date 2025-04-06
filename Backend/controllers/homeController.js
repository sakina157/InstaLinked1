const Post = require("../models/post");
const mongoose = require("mongoose");

// Add default user details
const defaultUser = {
  fullName: "Demo User",
  profileImage: "https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/people/profile-default.jpg",
  email: "user@example.com"
};

const samplePosts = [
  // Images
  {
    url: 'image/upload/v1/samples/ecommerce/accessories-bag.jpg',
    content_type: 'image',
    caption: 'Trending accessories',
    category: 'Fashion',
    user_email: defaultUser.email,
    created_at: new Date(),
    user: defaultUser
  },
  {
    url: 'image/upload/v1/samples/landscapes/beach-boat.jpg',
    content_type: 'image',
    caption: 'Beautiful sunset at the beach',
    category: 'Photography',
    user_email: defaultUser.email,
    created_at: new Date(),
    user: defaultUser
  },
  // Reels/Videos
  {
    url: 'video/upload/v1/samples/elephants.mp4',
    content_type: 'video',
    caption: 'Wildlife documentary',
    category: 'Education',
    user_email: defaultUser.email,
    created_at: new Date(),
    isReel: true,
    autoPlay: true,
    user: defaultUser
  },
  {
    url: 'video/upload/v1/samples/sea-turtle.mp4',
    content_type: 'video',
    caption: 'Sea life exploration',
    category: 'Nature',
    user_email: defaultUser.email,
    created_at: new Date(),
    isReel: true,
    autoPlay: true,
    user: defaultUser
  },
  // Audio Posts
  {
    url: 'audio/upload/v1/samples/ringtone.mp3',
    content_type: 'audio',
    caption: 'New ringtone alert!',
    category: 'Music',
    user_email: defaultUser.email,
    created_at: new Date(),
    thumbnail: 'image/upload/v1/samples/music/audio-thumb.jpg',
    user: defaultUser
  },
  {
    url: 'audio/upload/v1/samples/podcast.mp3',
    content_type: 'audio',
    caption: 'Tech podcast episode',
    category: 'Technology',
    user_email: defaultUser.email,
    created_at: new Date(),
    thumbnail: 'image/upload/v1/samples/music/podcast-thumb.jpg',
    user: defaultUser
  },
  // PDF Posts
  {
    url: 'document/upload/v1/samples/recipe.pdf',
    content_type: 'pdf',
    caption: 'Delicious recipe guide',
    category: 'Food',
    user_email: 'user@example.com',
    created_at: new Date(),
    thumbnail: 'image/upload/v1/samples/food/recipe-thumb.jpg'
  },
  // More diverse images
  {
    url: 'image/upload/v1/samples/food/spices.jpg',
    content_type: 'image',
    caption: 'Colorful spices',
    category: 'Food',
    user_email: 'user@example.com',
    created_at: new Date()
  },
  {
    url: 'image/upload/v1/samples/animals/cat.jpg',
    content_type: 'image',
    caption: 'Cute cat moment',
    category: 'Pets',
    user_email: 'user@example.com',
    created_at: new Date()
  },
  // Carousel Posts
  {
    url: 'image/upload/v1/samples/ecommerce/shoes.jpg',
    content_type: 'image',
    caption: 'New collection',
    category: 'Fashion',
    user_email: 'user@example.com',
    created_at: new Date(),
    isCarousel: true,
    carouselImages: [
      'image/upload/v1/samples/ecommerce/shoes-1.jpg',
      'image/upload/v1/samples/ecommerce/shoes-2.jpg',
      'image/upload/v1/samples/ecommerce/shoes-3.jpg'
    ]
  }
];

const homePage = async (req, res) => {
  try {
    console.log("Fetching posts from database...");
    
    // Get posts from database
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_email",
          foreignField: "email",
          as: "userDetails"
        }
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          url: {
            $cond: {
              if: { $gt: [{ $size: "$posts" }, 0] },
              then: { $arrayElemAt: ["$posts.url", 0] },
              else: {
                $cond: {
                  if: { $ne: [{ $type: "$image" }, "missing"] },
                  then: "$image",
                  else: {
                    $cond: {
                      if: { $ne: [{ $type: "$videoUrl" }, "missing"] },
                      then: "$videoUrl",
                      else: {
                        $cond: {
                          if: { $ne: [{ $type: "$pdfUrl" }, "missing"] },
                          then: "$pdfUrl",
                          else: "$audioUrl"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          content_type: {
            $cond: {
              if: { $gt: [{ $size: "$posts" }, 0] },
              then: { $arrayElemAt: ["$posts.content_type", 0] },
              else: "$mediaType"
            }
          },
          caption: {
            $cond: {
              if: { $gt: [{ $size: "$posts" }, 0] },
              then: { $arrayElemAt: ["$posts.caption", 0] },
              else: "$text"
            }
          },
          category: {
            $cond: {
              if: { $gt: [{ $size: "$posts" }, 0] },
              then: { $arrayElemAt: ["$posts.category", 0] },
              else: "$category"
            }
          },
          created_at: {
            $cond: {
              if: { $gt: [{ $size: "$posts" }, 0] },
              then: { $arrayElemAt: ["$posts.created_at", 0] },
              else: "$createdAt"
            }
          },
          user: {
            fullName: { $ifNull: ["$userDetails.fullName", defaultUser.fullName] },
            profileImage: { $ifNull: ["$userDetails.profileImage", defaultUser.profileImage] },
            email: { $ifNull: ["$userDetails.email", defaultUser.email] }
          }
        }
      },
      { $match: { url: { $ne: null } } },
      { $sort: { created_at: -1 } }
    ]);

    console.log(`Found ${posts.length} posts in database`);

    // If we have less than 120 posts, add sample posts
    if (posts.length < 120) {
      const neededPosts = 120 - posts.length;
      const samplePostsToAdd = [];
      
      // Generate multiple copies of sample posts with different timestamps and variations
      for (let i = 0; i < Math.ceil(neededPosts / samplePosts.length); i++) {
        samplePosts.forEach((post, index) => {
          if (samplePostsToAdd.length < neededPosts) {
            // Create variations of each post
            const variation = {
              ...post,
              _id: new mongoose.Types.ObjectId(),
              caption: `${post.caption} #${i + 1}`,
              created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
              marginBottom: '20px',
              user: defaultUser
            };

            // Add random likes and comments for variety
            variation.likes = Math.floor(Math.random() * 1000);
            variation.comments = Math.floor(Math.random() * 100);

            // For carousel posts, shuffle the images
            if (post.isCarousel) {
              variation.carouselImages = [...post.carouselImages].sort(() => Math.random() - 0.5);
            }

            samplePostsToAdd.push(variation);
          }
        });
      }

      // Add sample posts to the beginning of the array
      posts.unshift(...samplePostsToAdd);
    }
    
    // Transform URLs to ensure they have https://
    const transformedPosts = posts.map(post => ({
      ...post,
      url: post.url.startsWith('http') 
        ? post.url 
        : `https://res.cloudinary.com/do4ekgroe/${post.url}`,
      marginBottom: post.marginBottom || '20px',
      user: post.user || defaultUser
    }));

    console.log(`Total posts after adding samples: ${transformedPosts.length}`);
    res.json(transformedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  homePage
};
