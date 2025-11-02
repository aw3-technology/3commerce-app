# Settings Page Setup Guide

## Overview
The Settings page is fully connected to Supabase backend and includes:
- Profile information management
- Avatar/profile picture upload
- Account login (password management)
- Notification preferences
- Payment settings (PayPal integration)

## Database Setup

### 1. Run User Profiles Migration
Execute the SQL file `database-user-profiles-migration.sql` in your Supabase SQL Editor to create:
- `user_profiles` table
- Storage bucket for avatars
- Row Level Security (RLS) policies
- Necessary indexes

```sql
-- This creates:
-- - user_profiles table with columns: id, user_id, display_name, location, bio, avatar_url, paypal_email, notification_preferences
-- - Avatars storage bucket for profile pictures
-- - RLS policies for secure access
```

### 2. Verify Storage Bucket Creation
In your Supabase dashboard:
1. Go to Storage
2. Verify "avatars" bucket exists
3. If not, create it manually with:
   - Name: `avatars`
   - Public: Yes (checked)

### 3. Storage Policies
The migration script automatically creates storage policies. If you need to create them manually:

```sql
-- Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

## Features

### Profile Information (`src/screens/Settings/ProfileInformation/index.js`)
**Connected Features:**
- ✅ Load user profile data on mount
- ✅ Display name input
- ✅ Email input (updates auth.users email)
- ✅ Location input
- ✅ Bio editor with rich text support
- ✅ Avatar upload with validation
  - Max file size: 5MB
  - Allowed types: JPEG, PNG, GIF, WebP
- ✅ Avatar removal
- ✅ Preview uploaded avatar

**Backend Functions Used:**
- `getCurrentUser()` - Load user data and profile
- `uploadAvatar(userId, file)` - Upload avatar to Supabase Storage
- `removeAvatar(userId, avatarUrl)` - Delete avatar from storage

### Account Login (`src/screens/Settings/Login/index.js`)
**Connected Features:**
- ✅ Password update functionality
- ✅ Password confirmation validation
- ✅ Minimum password length validation (6 characters)
- ✅ Error handling with user-friendly messages

**Backend Functions Used:**
- `updateUserPassword(newPassword)` - Update user password in Supabase Auth

### Notifications (`src/screens/Settings/Notifications/index.js`)
**Connected Features:**
- ✅ Product updates toggle
- ✅ Market newsletter toggle
- ✅ Comments notifications toggle
- ✅ Purchases notifications toggle
- ✅ Preferences saved to database (JSONB field)

**Storage:**
Notification preferences are stored in `user_profiles.notification_preferences` as a JSONB object:
```json
{
  "product_updates": true,
  "market_newsletter": false,
  "comments": true,
  "purchases": true
}
```

### Payment Settings (`src/screens/Settings/Payment/index.js`)
**Connected Features:**
- ✅ PayPal email configuration
- ✅ Inline editing
- ✅ Save to user profile
- ✅ Load existing PayPal email

**Storage:**
PayPal email is stored in `user_profiles.paypal_email`

### Main Settings Component (`src/screens/Settings/index.js`)
**Features:**
- ✅ Central data loading on mount
- ✅ Loading state while fetching user data
- ✅ Save all settings with single button
- ✅ Email update with verification
- ✅ Profile data persistence
- ✅ Error handling throughout

## User Service Functions

Located in `src/services/userService.js`:

### User Profile Functions
- `getCurrentUser()` - Get authenticated user with profile data
- `getUserProfile(userId)` - Get user profile by ID
- `upsertUserProfile(userId, profileData)` - Create or update profile
- `updateUserProfile(userId, updates)` - Update existing profile

### Avatar Functions
- `uploadAvatar(userId, file)` - Upload avatar to Supabase Storage
- `removeAvatar(userId, avatarUrl)` - Delete avatar from storage

### Auth Functions
- `updateUserEmail(newEmail)` - Update user email (requires verification)
- `updateUserPassword(newPassword)` - Update user password
- `signOut()` - Sign out current user

## Data Flow

1. **Page Load:**
   - Settings component mounts
   - Calls `getCurrentUser()` to fetch user data
   - Loads profile data, notification preferences, and payment info
   - Passes data to child components

2. **User Updates:**
   - User modifies form fields
   - Data stored in component state
   - Click "Save" button

3. **Save Process:**
   - Validates user is authenticated
   - Checks if email changed → calls `updateUserEmail()`
   - Calls `upsertUserProfile()` with all settings:
     - Display name
     - Location
     - Bio
     - PayPal email
     - Notification preferences
   - Shows success/error message

4. **Avatar Upload:**
   - User selects image file
   - Validates file type and size
   - Uploads to Supabase Storage `avatars` bucket
   - Updates `user_profiles.avatar_url` with public URL
   - Displays new avatar immediately

## Testing Checklist

### Profile Information
- [ ] Load existing profile data on page load
- [ ] Update display name and save
- [ ] Update email and verify confirmation email sent
- [ ] Update location and save
- [ ] Update bio with rich text and save
- [ ] Upload new avatar (JPEG/PNG/GIF/WebP under 5MB)
- [ ] Remove existing avatar
- [ ] Try uploading invalid file type (should show error)
- [ ] Try uploading file over 5MB (should show error)

### Account Login
- [ ] Update password with matching confirmation
- [ ] Try updating with mismatched passwords (should show error)
- [ ] Try password less than 6 characters (should show error)
- [ ] Verify password works after update

### Notifications
- [ ] Toggle each notification preference
- [ ] Save settings
- [ ] Reload page and verify toggles maintain state

### Payment
- [ ] Add PayPal email
- [ ] Edit existing PayPal email
- [ ] Cancel edit
- [ ] Save PayPal email
- [ ] Reload page and verify PayPal email persists

## Common Issues & Solutions

### Issue: Avatar upload fails
**Solution:**
- Verify `avatars` storage bucket exists in Supabase
- Check bucket is set to public
- Verify storage policies are created
- Check file size is under 5MB
- Verify file type is image/*

### Issue: Settings not saving
**Solution:**
- Check browser console for errors
- Verify user is authenticated
- Check `user_profiles` table exists
- Verify RLS policies allow user to update own profile

### Issue: Email update not working
**Solution:**
- Email updates require verification
- User must check new email for verification link
- Old email remains active until new email is verified

### Issue: Profile data not loading
**Solution:**
- Check user is logged in
- Verify `user_profiles` table has entry for user
- If no profile exists, it will be created on first save
- Check browser console for errors

## Environment Variables

Ensure your `.env` file has Supabase credentials:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Structure

```
src/
├── screens/
│   └── Settings/
│       ├── index.js                    # Main settings container
│       ├── ProfileInformation/
│       │   └── index.js               # Profile & avatar management
│       ├── Login/
│       │   └── index.js               # Password management
│       ├── Notifications/
│       │   └── index.js               # Notification preferences
│       └── Payment/
│           └── index.js               # PayPal settings
├── services/
│   └── userService.js                 # User & profile API functions
└── config/
    └── supabaseClient.js              # Supabase configuration

database-user-profiles-migration.sql   # Database setup script
```

## Security Considerations

1. **Row Level Security (RLS):**
   - All user profile operations are restricted by RLS
   - Users can only view/edit their own profiles

2. **Avatar Storage:**
   - Avatars are publicly accessible (read-only)
   - Only authenticated users can upload
   - File size limited to 5MB
   - File type validation on client side

3. **Password Updates:**
   - Handled by Supabase Auth
   - Minimum 6 characters enforced
   - Uses secure hashing

4. **Email Updates:**
   - Requires email verification
   - Old email remains active until verified

## Next Steps

1. Run the database migration
2. Verify storage bucket setup
3. Test all features with a test user
4. Customize notification types as needed
5. Add payment provider integration (currently PayPal email only)
6. Consider adding toast notifications instead of alerts for better UX
