-- Additional Tables for 3Commerce App
-- Run this to add missing tables that other services need

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (for extended user info)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Likes Table (for product likes/favorites)
CREATE TABLE IF NOT EXISTS customer_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- Order Items Table (if not exists - for product earnings calculation)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables
-- Add user_id to notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='notifications' AND column_name='user_id') THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add sender_id and recipient_id to messages if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='messages' AND column_name='sender_id') THEN
        ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='messages' AND column_name='recipient_id') THEN
        ALTER TABLE messages ADD COLUMN recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add status column to customers if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='customers' AND column_name='status') THEN
        ALTER TABLE customers ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_likes_customer_id ON customer_likes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_likes_product_id ON customer_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- User Profiles: Users can manage their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Customer Likes: Public read, authenticated write
DROP POLICY IF EXISTS "Enable read access for customer likes" ON customer_likes;
CREATE POLICY "Enable read access for customer likes" ON customer_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON customer_likes;
CREATE POLICY "Enable insert for authenticated users" ON customer_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for own likes" ON customer_likes;
CREATE POLICY "Enable delete for own likes" ON customer_likes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Order Items: Public read
DROP POLICY IF EXISTS "Enable read access for order items" ON order_items;
CREATE POLICY "Enable read access for order items" ON order_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for order items" ON order_items;
CREATE POLICY "Enable insert for order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Update existing policies for messages to handle new columns
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR
        auth.uid() = recipient_id OR
        sender_id IS NULL OR
        recipient_id IS NULL
    );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id OR
        sender_id IS NULL
    );

-- Update existing policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        auth.uid() = user_id OR
        user_id IS NULL
    );

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        auth.uid() = user_id OR
        user_id IS NULL
    );

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (
        auth.uid() = user_id OR
        user_id IS NULL
    );

-- Create storage bucket for avatars if it doesn't exist (this needs to be done via Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;
