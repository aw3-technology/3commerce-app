-- Social Media Posts/Promotion Schema
-- Run this SQL in your Supabase SQL Editor to add promotion functionality

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    post_type VARCHAR(50) DEFAULT 'picture', -- picture, video, text
    status VARCHAR(50) DEFAULT 'published', -- draft, published, scheduled

    -- Social media platforms
    platforms JSONB DEFAULT '[]'::jsonb, -- ['facebook', 'twitter', 'instagram']

    -- Engagement metrics
    people_reached INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
    comments_count INTEGER DEFAULT 0,
    link_clicks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    distribution_rate DECIMAL(5, 2) DEFAULT 0, -- engagement multiplier

    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Post Analytics (daily breakdown)
CREATE TABLE IF NOT EXISTS social_post_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,

    -- Daily metrics
    views INTEGER DEFAULT 0,
    link_clicks INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion Insights (aggregated metrics)
CREATE TABLE IF NOT EXISTS promotion_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Aggregated metrics
    people_reached INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_link_clicks INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_post_analytics_post_id ON social_post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_analytics_date ON social_post_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_promotion_insights_user_id ON promotion_insights(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_posts
CREATE POLICY "Users can view their own posts" ON social_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_post_analytics
CREATE POLICY "Users can view analytics for their posts" ON social_post_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts
            WHERE social_posts.id = social_post_analytics.post_id
            AND social_posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analytics for their posts" ON social_post_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM social_posts
            WHERE social_posts.id = social_post_analytics.post_id
            AND social_posts.user_id = auth.uid()
        )
    );

-- RLS Policies for promotion_insights
CREATE POLICY "Users can view their own insights" ON promotion_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights" ON promotion_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" ON promotion_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_insights_updated_at BEFORE UPDATE ON promotion_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets for post images and videos
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('post-images', 'post-images', true),
    ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-images bucket
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their post images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their post images"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- Storage policies for videos bucket
CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
