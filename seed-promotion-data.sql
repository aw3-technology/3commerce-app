-- Seed promotion data
-- This inserts sample social media posts and analytics

-- Note: Replace the user_id with an actual auth.users id if you want to test with a real user
-- For now, we'll temporarily disable RLS to insert sample data

-- Temporarily disable RLS
ALTER TABLE social_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_analytics DISABLE ROW LEVEL SECURITY;

-- Get a user_id (or create a dummy one for testing)
-- If you have an authenticated user, you can query: SELECT id FROM auth.users LIMIT 1;
-- For testing purposes, we'll use a placeholder UUID

-- Insert sample posts
INSERT INTO social_posts (user_id, title, content, image_url, post_type, status, platforms, people_reached, engagement_rate, comments_count, link_clicks, views, distribution_rate, published_at, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Hurry up! You got 50% off – all items 🔥',
    'Amazing sale happening now! Don''t miss out on our biggest discount of the year.',
    '/images/content/post-pic-1.jpg',
    'picture',
    'published',
    '["facebook", "twitter"]'::jsonb,
    256000,
    1.2,
    128,
    80,
    1500,
    1.2,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'HTML version has been released',
    'We''re excited to announce the release of our new HTML version with improved features!',
    '/images/content/post-pic-2.jpg',
    'video',
    'published',
    '["twitter"]'::jsonb,
    180000,
    1.6,
    95,
    65,
    2100,
    1.6,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'New Product Launch - Coming Soon!',
    'Stay tuned for our exciting new product launch next week. You won''t want to miss this!',
    '/images/content/post-pic-3.jpg',
    'picture',
    'published',
    '["facebook", "twitter"]'::jsonb,
    145000,
    0.9,
    67,
    123,
    980,
    -1.5,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Customer Success Story',
    'See how our customers are achieving amazing results with our platform!',
    '/images/content/post-pic-4.jpg',
    'video',
    'published',
    '["twitter"]'::jsonb,
    92000,
    1.9,
    54,
    45,
    1890,
    1.9,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Limited Time Offer - Act Fast!',
    'This exclusive offer expires in 24 hours. Get yours before it''s too late!',
    '/images/content/post-pic-5.jpg',
    'picture',
    'published',
    '["facebook", "twitter"]'::jsonb,
    201000,
    1.1,
    89,
    156,
    1250,
    -1.1,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Insert sample analytics for each post
-- We'll add 7 days of analytics for each post
WITH post_ids AS (
  SELECT id FROM social_posts WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
),
dates AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '1 day',
    '1 day'::interval
  )::date AS date
)
INSERT INTO social_post_analytics (post_id, date, views, link_clicks, comments, shares, likes, engagement_rate)
SELECT
  p.id,
  d.date,
  floor(random() * 400 + 100)::int AS views,
  floor(random() * 40 + 10)::int AS link_clicks,
  floor(random() * 15 + 5)::int AS comments,
  floor(random() * 25 + 5)::int AS shares,
  floor(random() * 80 + 20)::int AS likes,
  round((random() * 2.5 + 0.5)::numeric, 2) AS engagement_rate
FROM post_ids p
CROSS JOIN dates d;

-- Re-enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_analytics ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to allow read access for the dummy user
-- This allows the frontend to read the sample data
CREATE POLICY "Allow read access for sample data" ON social_posts
    FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Allow analytics read for sample data" ON social_post_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts
            WHERE social_posts.id = social_post_analytics.post_id
            AND social_posts.user_id = '00000000-0000-0000-0000-000000000001'::uuid
        )
    );

SELECT 'Sample promotion data seeded successfully!' AS status;
