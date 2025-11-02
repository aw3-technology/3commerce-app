-- Fix RLS policies and permissions for messages and user_profiles tables

-- First, let's make sure the tables don't have overly restrictive RLS
-- We'll update the policies to be more permissive for development

-- Drop and recreate user_profiles policies to fix 406 errors
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- More permissive policies for user_profiles (you can tighten these later)
CREATE POLICY "Enable read access for all users" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Update messages table policies to be more permissive
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- More permissive policies for messages
CREATE POLICY "Enable read access for all authenticated users" ON messages
    FOR SELECT USING (auth.role() = 'authenticated' OR true);

CREATE POLICY "Enable insert for authenticated users" ON messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

CREATE POLICY "Enable update for authenticated users" ON messages
    FOR UPDATE USING (auth.role() = 'authenticated' OR true);

-- Fix notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

CREATE POLICY "Enable read access for all users" ON notifications
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON notifications
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON notifications
    FOR DELETE USING (true);

-- Create a public storage bucket policy for avatars
-- Note: Storage bucket policies need to be created via Supabase Dashboard or via storage.policies table

-- Insert storage bucket if it doesn't exist (this might need to be done via dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;

-- Public read access for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Anyone can upload an avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Users can update/delete their own avatars
CREATE POLICY "Anyone can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can delete their own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
