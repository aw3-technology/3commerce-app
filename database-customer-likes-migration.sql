-- Customer Likes Table Migration
-- This table tracks products that customers have liked

CREATE TABLE IF NOT EXISTS customer_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_likes_customer_id ON customer_likes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_likes_product_id ON customer_likes(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view likes for their customers" ON customer_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE customers.id = customer_likes.customer_id
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert likes for their customers" ON customer_likes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM customers
            WHERE customers.id = customer_likes.customer_id
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete likes for their customers" ON customer_likes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE customers.id = customer_likes.customer_id
            AND customers.user_id = auth.uid()
        )
    );
