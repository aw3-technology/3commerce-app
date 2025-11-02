const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function seedPromotionData() {
  console.log('🌱 Seeding promotion data...');

  try {
    // First, get the current user or create a test user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let userId;
    if (authError || !user) {
      console.log('No authenticated user. Creating sample posts with a placeholder user_id...');
      // For testing, we'll use a dummy UUID
      userId = '00000000-0000-0000-0000-000000000000';
    } else {
      userId = user.id;
      console.log(`Using authenticated user: ${userId}`);
    }

    // Sample posts data
    const samplePosts = [
      {
        user_id: userId,
        title: 'Hurry up! You got 50% off – all items 🔥',
        content: 'Amazing sale happening now! Don\'t miss out on our biggest discount of the year.',
        image_url: '/images/content/post-pic-1.jpg',
        post_type: 'picture',
        status: 'published',
        platforms: ['facebook', 'twitter'],
        people_reached: 256000,
        engagement_rate: 1.2,
        comments_count: 128,
        link_clicks: 80,
        views: 1500,
        distribution_rate: 1.2,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        user_id: userId,
        title: 'HTML version has been released',
        content: 'We\'re excited to announce the release of our new HTML version with improved features!',
        image_url: '/images/content/post-pic-2.jpg',
        post_type: 'video',
        status: 'published',
        platforms: ['twitter'],
        people_reached: 180000,
        engagement_rate: 1.6,
        comments_count: 95,
        link_clicks: 65,
        views: 2100,
        distribution_rate: 1.6,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        user_id: userId,
        title: 'New Product Launch - Coming Soon!',
        content: 'Stay tuned for our exciting new product launch next week. You won\'t want to miss this!',
        image_url: '/images/content/post-pic-3.jpg',
        post_type: 'picture',
        status: 'published',
        platforms: ['facebook', 'twitter'],
        people_reached: 145000,
        engagement_rate: 0.9,
        comments_count: 67,
        link_clicks: 123,
        views: 980,
        distribution_rate: -1.5,
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        user_id: userId,
        title: 'Customer Success Story',
        content: 'See how our customers are achieving amazing results with our platform!',
        image_url: '/images/content/post-pic-4.jpg',
        post_type: 'video',
        status: 'published',
        platforms: ['twitter'],
        people_reached: 92000,
        engagement_rate: 1.9,
        comments_count: 54,
        link_clicks: 45,
        views: 1890,
        distribution_rate: 1.9,
        published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      },
      {
        user_id: userId,
        title: 'Limited Time Offer - Act Fast!',
        content: 'This exclusive offer expires in 24 hours. Get yours before it\'s too late!',
        image_url: '/images/content/post-pic-5.jpg',
        post_type: 'picture',
        status: 'published',
        platforms: ['facebook', 'twitter'],
        people_reached: 201000,
        engagement_rate: 1.1,
        comments_count: 89,
        link_clicks: 156,
        views: 1250,
        distribution_rate: -1.1,
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ];

    // Insert posts using the service account key (bypassing RLS for seeding)
    console.log('Inserting sample posts...');

    // We need to disable RLS temporarily or use service role key
    // For now, let's just try with the anon key
    const { data: posts, error: postsError } = await supabase
      .from('social_posts')
      .insert(samplePosts)
      .select();

    if (postsError) {
      console.error('Error inserting posts:', postsError);
      console.log('\n⚠️  If you see RLS policy errors, you need to:');
      console.log('1. Sign in to the app first to create an authenticated user');
      console.log('2. Or temporarily disable RLS on social_posts table');
      console.log('3. Or use the Supabase service role key instead of anon key\n');
      return;
    }

    console.log(`✅ Inserted ${posts.length} sample posts`);

    // Add some analytics data for the posts
    if (posts && posts.length > 0) {
      console.log('Adding analytics data...');

      const analyticsData = [];
      posts.forEach((post) => {
        // Add analytics for the last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          analyticsData.push({
            post_id: post.id,
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 500) + 100,
            link_clicks: Math.floor(Math.random() * 50) + 10,
            comments: Math.floor(Math.random() * 20) + 5,
            shares: Math.floor(Math.random() * 30) + 5,
            likes: Math.floor(Math.random() * 100) + 20,
            engagement_rate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
          });
        }
      });

      const { error: analyticsError } = await supabase
        .from('social_post_analytics')
        .insert(analyticsData);

      if (analyticsError) {
        console.error('Error inserting analytics:', analyticsError);
      } else {
        console.log(`✅ Inserted ${analyticsData.length} analytics records`);
      }
    }

    console.log('\n🎉 Promotion data seeded successfully!');
    console.log('You can now view the Promote page with real data.\n');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedPromotionData();
