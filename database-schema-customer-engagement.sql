-- Customer Engagement Metrics Schema Update for 3Commerce
-- Run this SQL in your Supabase SQL Editor to add engagement tracking

-- Add engagement columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'; -- active, inactive, new

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_username ON customers(username);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_last_login ON customers(last_login);
CREATE INDEX IF NOT EXISTS idx_customers_order_count ON customers(order_count);

-- Customer Likes Table (tracks what customers like)
CREATE TABLE IF NOT EXISTS customer_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_likes_customer_id ON customer_likes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_likes_product_id ON customer_likes(product_id);

ALTER TABLE customer_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON customer_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON customer_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their likes" ON customer_likes
    FOR DELETE USING (true);

-- Function to update customer's like count
CREATE OR REPLACE FUNCTION update_customer_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE customers
        SET like_count = like_count + 1
        WHERE id = NEW.customer_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE customers
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.customer_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update like count
DROP TRIGGER IF EXISTS trigger_update_like_count ON customer_likes;
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON customer_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_like_count();

-- Function to update customer's comment count
CREATE OR REPLACE FUNCTION update_customer_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.customer_id IS NOT NULL THEN
        UPDATE customers
        SET comment_count = comment_count + 1
        WHERE id = NEW.customer_id;
    ELSIF TG_OP = 'DELETE' AND OLD.customer_id IS NOT NULL THEN
        UPDATE customers
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.customer_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update comment count
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_comment_count();

-- View for customer list with all engagement metrics
CREATE OR REPLACE VIEW customer_list_view AS
SELECT
    c.id,
    c.name,
    c.username,
    c.email,
    c.avatar_url,
    c.phone,
    c.order_count as purchase,
    c.total_spent as lifetime_value,
    c.comment_count,
    c.like_count,
    c.status,
    c.last_login,
    c.created_at,
    c.updated_at,
    -- Calculate lifetime growth percentage (placeholder - you can customize this)
    CASE
        WHEN c.order_count > 0 THEN
            ROUND(((c.total_spent / c.order_count) / 100.0) * 100, 1)
        ELSE 0
    END as lifetime_growth_percentage
FROM customers c;

-- Function to mark customers as 'new' or 'active' based on criteria
CREATE OR REPLACE FUNCTION update_customer_status()
RETURNS void AS $$
BEGIN
    -- Mark as 'new' if created within last 7 days
    UPDATE customers
    SET status = 'new'
    WHERE created_at >= NOW() - INTERVAL '7 days'
    AND status != 'new';

    -- Mark as 'active' if logged in within last 30 days and not new
    UPDATE customers
    SET status = 'active'
    WHERE last_login >= NOW() - INTERVAL '30 days'
    AND created_at < NOW() - INTERVAL '7 days'
    AND status != 'active';

    -- Mark as 'inactive' if not logged in within last 30 days and not new
    UPDATE customers
    SET status = 'inactive'
    WHERE (last_login < NOW() - INTERVAL '30 days' OR last_login IS NULL)
    AND created_at < NOW() - INTERVAL '7 days'
    AND status != 'inactive';
END;
$$ LANGUAGE plpgsql;

-- You can run this function periodically (e.g., daily via a cron job)
-- SELECT update_customer_status();

-- Sample data for testing (optional - remove in production)
-- First, let's update existing customers with engagement data
-- UPDATE customers SET username = CONCAT('@', LOWER(REPLACE(name, ' ', '_'))) WHERE username IS NULL;
-- UPDATE customers SET comment_count = FLOOR(RANDOM() * 50), like_count = FLOOR(RANDOM() * 50), status = 'active';
