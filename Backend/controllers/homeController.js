const cloudinary = require('cloudinary').v2;
const Post = require('../models/post');
const User = require('../models/user');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'do4ekgroe',
  api_key: '699971144517436',
  api_secret: 'vPTgOBQQJ_7vUGKPhxgPOPGhvZY'
});

// Sample posts with Cloudinary URLs
const samplePosts = [
  {
    url: 'https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
    content_type: 'image',
    caption: 'Trending accessories #fashion',
    category: 'Fashion'
  },
  {
    url: 'https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/landscapes/beach-boat.jpg',
    content_type: 'image',
    caption: 'Beautiful sunset at the beach #photography',
    category: 'Photography'
  },
  {
    url: 'https://res.cloudinary.com/do4ekgroe/video/upload/v1/samples/elephants.mp4',
    content_type: 'video',
    caption: 'Wildlife documentary #nature',
    category: 'Nature',
    isReel: true,
    autoPlay: true
  },
  {
    url: 'https://res.cloudinary.com/do4ekgroe/video/upload/v1/samples/sea-turtle.mp4',
    content_type: 'video',
    caption: 'Sea life exploration #underwater',
    category: 'Nature',
    isReel: true,
    autoPlay: true
  },
  {
    url: 'https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/food/spices.jpg',
    content_type: 'image',
    caption: 'Colorful spices from around the world #food',
    category: 'Food'
  }
];

// Generate 120 sample posts with random timestamps
const generateSamplePosts = () => {
  const posts = [];
  const categories = ['Nature', 'Food', 'Animals', 'Travel', 'Art'];
  const baseTemplates = samplePosts;

  for (let i = 0; i < 120; i++) {
    const template = baseTemplates[i % baseTemplates.length];
    const randomDays = Math.floor(Math.random() * 30); // Random day in the last month
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    
    const created_at = new Date();
    created_at.setDate(created_at.getDate() - randomDays);
    created_at.setHours(created_at.getHours() - randomHours);
    created_at.setMinutes(created_at.getMinutes() - randomMinutes);

    posts.push({
      _id: `demo_${i}`,
      url: template.url,
      content_type: template.content_type,
      caption: template.caption,
      category: categories[Math.floor(Math.random() * categories.length)],
      created_at: created_at.toISOString(),
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
          user: {
        username: 'Demo User',
        email: 'demo@example.com',
        profileImage: 'https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/people/boy-snow-hoodie'
      }
    });
  }

  return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

exports.homePage = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (email) {
      // If email is provided, only return that user's posts
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userPosts = await Post.find({ user_email: email })
        .sort({ created_at: -1 })
        .lean();

      // Transform user posts to match the format
      const transformedPosts = userPosts.map(post => ({
        ...post,
        user: {
          username: user.username || 'User',
          email: user.email,
          profileImage: user.profileImage || 'https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/people/boy-snow-hoodie.jpg'
        }
      }));

      return res.json(transformedPosts);
    }

    // Generate posts with random timestamps
    const demoPosts = Array.from({ length: 120 }, (_, i) => {
      const template = samplePosts[i % samplePosts.length];
      const randomDays = Math.floor(Math.random() * 30);
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      
      const created_at = new Date();
      created_at.setDate(created_at.getDate() - randomDays);
      created_at.setHours(created_at.getHours() - randomHours);
      created_at.setMinutes(created_at.getMinutes() - randomMinutes);

      return {
        _id: `demo_${i}`,
        ...template,
        created_at: created_at.toISOString(),
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        user: {
          username: 'Demo User',
          email: 'demo@example.com',
          profileImage: 'https://res.cloudinary.com/do4ekgroe/image/upload/v1/samples/people/boy-snow-hoodie.jpg'
        }
      };
    });

    res.json(demoPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

  } catch (error) {
    console.error('Error in homePage:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
