# Profile Integration Setup Guide

This guide will help you set up the user profile functionality in your 3Commerce app.

## Overview

The profile integration connects the following pages to the Supabase backend:
- **Shop Profile Page**: Displays user profile information
- **Settings Page**: Allows users to edit their profile information

## Prerequisites

- Supabase project set up and running
- Environment variables configured in `.env` file:
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`

## Database Setup

### 1. Create the user_profiles table

Run the SQL script in your Supabase SQL Editor:

```bash
scripts/create-user-profiles-table.sql
```

Or manually execute the SQL:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor**
3. Copy and paste the contents of `scripts/create-user-profiles-table.sql`
4. Click **Run** to execute the SQL

### 2. Create the avatars storage bucket (Optional)

If you want to enable avatar uploads:

1. Go to your Supabase dashboard
2. Navigate to: **Storage**
3. Click **New bucket**
4. Name it: `avatars`
5. Make it **Public**
6. Click **Create bucket**

### 3. Set up storage policies

Run these policies in the SQL Editor to allow users to upload/manage avatars:

```sql
-- Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Features

### Shop Profile Page

Located at: `src/screens/Shop/Profile/index.js`

**Features:**
- Displays user's avatar
- Shows display name
- Shows bio
- Shows social media links (Twitter, Instagram, Pinterest)
- Automatically fetches data from backend on page load
- Shows loading state while fetching
- Shows error state with retry button if fetch fails

### Settings Page - Profile Information

Located at: `src/screens/Settings/ProfileInformation/index.js`

**Features:**
- Edit display name
- Edit email (read-only)
- Edit location
- Edit bio (rich text editor)
- Upload new avatar image
- Remove avatar
- Real-time avatar preview
- File validation (image types, max 5MB)

### Settings Page - Save Functionality

Located at: `src/screens/Settings/index.js`

**Features:**
- Save all profile changes to backend
- Shows saving state on button
- Success/error alerts
- Persists data across page refreshes

## Service Layer

### userService.js

Located at: `src/services/userService.js`

**Available Functions:**

1. `getCurrentUser()` - Get authenticated user with profile data
2. `getUserProfile(userId)` - Get user profile by ID
3. `upsertUserProfile(userId, profileData)` - Create or update profile
4. `updateUserProfile(userId, updates)` - Update existing profile
5. `uploadAvatar(userId, file)` - Upload avatar image
6. `removeAvatar(userId, avatarUrl)` - Remove avatar image
7. `updateUserEmail(newEmail)` - Update user email
8. `updateUserPassword(newPassword)` - Update user password
9. `signOut()` - Sign out user

## Testing

### Verify Database Setup

Run the setup script to check if everything is configured:

```bash
node setup-user-profiles.js
```

### Manual Testing Steps

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Sign in to the app** (you need authentication to create profiles)

3. **Navigate to Settings page:**
   - Fill in profile information
   - Upload an avatar
   - Click **Save**
   - You should see a success message

4. **Navigate to Shop Profile page:**
   - You should see your profile information displayed
   - Your avatar should be visible
   - Your bio should be shown

5. **Test editing:**
   - Go back to Settings
   - Change some information
   - Click **Save**
   - Navigate to Profile page to verify changes

## Troubleshooting

### Issue: "user_profiles table does not exist"

**Solution:** Run the SQL script in Supabase SQL Editor (see Database Setup step 1)

### Issue: "Failed to fetch user profile"

**Solutions:**
1. Make sure you're signed in
2. Check that RLS policies are set up correctly
3. Verify your Supabase credentials in `.env`

### Issue: "Failed to upload avatar"

**Solutions:**
1. Make sure the `avatars` storage bucket exists and is public
2. Check storage policies are set up correctly
3. Verify file is an image and under 5MB

### Issue: "Profile data not persisting"

**Solutions:**
1. Check browser console for errors
2. Verify the Save button is clicked
3. Check Supabase dashboard to see if data is being saved

## Database Schema

The `user_profiles` table has the following structure:

```sql
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  display_name VARCHAR(255),
  bio TEXT,
  location VARCHAR(255),
  avatar_url TEXT,
  social_twitter VARCHAR(255),
  social_instagram VARCHAR(255),
  social_pinterest VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Next Steps

- Add authentication pages (Sign In/Sign Up)
- Add password change functionality in Settings
- Add email verification
- Add more profile fields as needed
- Add social media URL validation
- Add profile privacy settings

## Support

If you encounter any issues, check:
1. Supabase dashboard for errors
2. Browser console for JavaScript errors
3. Network tab for API request/response details
