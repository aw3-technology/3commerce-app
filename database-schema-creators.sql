-- Creators Table Schema for 3Commerce
-- Run this SQL in your Supabase SQL Editor to add creators functionality

-- Creators Table
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    color_number VARCHAR(20), -- Badge color for top-ranked creators
    followers INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0,
    total_sales DECIMAL(10, 2) DEFAULT 0,
    trending_score INTEGER DEFAULT 0, -- Score for trending calculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add creator_id to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_creators_followers ON creators(followers DESC);
CREATE INDEX IF NOT EXISTS idx_creators_total_sales ON creators(total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_creators_trending_score ON creators(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_creators_created_at ON creators(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_products_creator_id ON products(creator_id);

-- Enable Row Level Security (RLS)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators
-- Public can view all creators
CREATE POLICY "Enable read access for all creators" ON creators
    FOR SELECT USING (true);

-- Users can only update their own creator profile
CREATE POLICY "Users can update their own creator profile" ON creators
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own creator profile
CREATE POLICY "Users can insert their own creator profile" ON creators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creator Follows Table (for follow/unfollow functionality)
CREATE TABLE IF NOT EXISTS creator_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(creator_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_follows_creator_id ON creator_follows(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_follows_user_id ON creator_follows(user_id);

ALTER TABLE creator_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" ON creator_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow creators" ON creator_follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow creators" ON creator_follows
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update creator's follower count
CREATE OR REPLACE FUNCTION update_creator_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE creators
        SET followers = followers + 1
        WHERE id = NEW.creator_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE creators
        SET followers = GREATEST(followers - 1, 0)
        WHERE id = OLD.creator_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update follower count
DROP TRIGGER IF EXISTS trigger_update_follower_count ON creator_follows;
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON creator_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_follower_count();

-- Function to update creator's product count
CREATE OR REPLACE FUNCTION update_creator_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.creator_id IS NOT NULL THEN
        UPDATE creators
        SET product_count = product_count + 1
        WHERE id = NEW.creator_id;
    ELSIF TG_OP = 'DELETE' AND OLD.creator_id IS NOT NULL THEN
        UPDATE creators
        SET product_count = GREATEST(product_count - 1, 0)
        WHERE id = OLD.creator_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.creator_id IS NOT NULL AND NEW.creator_id IS NULL THEN
            UPDATE creators
            SET product_count = GREATEST(product_count - 1, 0)
            WHERE id = OLD.creator_id;
        ELSIF OLD.creator_id IS NULL AND NEW.creator_id IS NOT NULL THEN
            UPDATE creators
            SET product_count = product_count + 1
            WHERE id = NEW.creator_id;
        ELSIF OLD.creator_id != NEW.creator_id THEN
            UPDATE creators
            SET product_count = GREATEST(product_count - 1, 0)
            WHERE id = OLD.creator_id;
            UPDATE creators
            SET product_count = product_count + 1
            WHERE id = NEW.creator_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update product count
DROP TRIGGER IF EXISTS trigger_update_product_count ON products;
CREATE TRIGGER trigger_update_product_count
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_product_count();

-- Sample data for testing (optional - remove in production)
-- INSERT INTO creators (name, avatar_url, bio, color_number, followers, product_count, total_sales, trending_score) VALUES
-- ('Reed Parker', '/images/content/avatar-1.jpg', 'Digital products creator', '#B5E4CA', 3568, 16, 12500.00, 850),
-- ('Tristian Hermiston', '/images/content/avatar-2.jpg', 'UI/UX specialist', '#FFD88D', 2345, 34, 8900.00, 720),
-- ('Rosetta Gottlieb', '/images/content/avatar-3.jpg', 'Designer & developer', '#CABDFF', 13242, 9, 45200.00, 950),
-- ('Nicola Gislason', '/images/content/avatar-4.jpg', 'Creative designer', '#B5E4CA', 1211, 22, 5400.00, 450),
-- ('Hester Grady', '/images/content/avatar-5.jpg', 'Product designer', '#FFD88D', 9832, 31, 32100.00, 880);
