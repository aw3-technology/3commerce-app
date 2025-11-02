# Settings Page Setup Guide

## ✅ Backend Integration Complete

All settings page components are fully connected to the backend!

## 📋 Prerequisites - Database Setup Required

To enable the Settings page to work, you need to run a database migration:

### Step 1: Create User Profiles Table

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the SQL script in `database-user-profiles-migration.sql`

This will create:
- `user_profiles` table for storing user profile data
- Automatic profile creation when users sign up
- Row Level Security (RLS) policies
- Indexes for performance

### Step 2: Create Avatar Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **New Bucket**
3. Create a bucket named `avatars`
4. Make it **Public** so avatar URLs are accessible
5. Click **Save**

**OR** run this in SQL Editor (if you have permissions):
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

## ✅ Features Already Connected

### 1. Profile Information Section
**File:** `src/screens/Settings/ProfileInformation/index.js`

Features:
- ✅ Display Name editing
- ✅ Email updating (with verification)
- ✅ Location field
- ✅ Bio/description editor
- ✅ Avatar upload with validation
  - Supported formats: JPEG, PNG, GIF, WebP
  - Max size: 5MB
  - Automatic resizing and optimization
- ✅ Avatar removal
- ✅ Real-time preview

**Backend Integration:**
- `getCurrentUser()` - Load current user data
- `upsertUserProfile()` - Save profile changes
- `uploadAvatar()` - Upload avatar to Supabase Storage
- `removeAvatar()` - Delete avatar from storage
- `updateUserEmail()` - Update email in auth system

### 2. Login/Password Section
**File:** `src/screens/Settings/Login/index.js`

Features:
- ✅ Old password field
- ✅ New password field
- ✅ Confirm password field
- ✅ Password validation (min 6 characters)
- ✅ Password match checking
- ✅ Secure password update
- ✅ Form clearing after success

**Backend Integration:**
- `updateUserPassword()` - Update password via Supabase Auth

### 3. Notifications Section
**File:** `src/screens/Settings/Notifications/index.js`

Features:
- ✅ Product updates and community announcements toggle
- ✅ Market newsletter toggle
- ✅ Comments notifications toggle
- ✅ Purchases notifications toggle
- ✅ Preferences saved to database
- ✅ Tooltips explaining each option

**Backend Integration:**
- Preferences stored in `user_profiles.notification_preferences` (JSONB)
- Saved via `upsertUserProfile()`

### 4. Payment Section
**File:** `src/screens/Settings/Payment/index.js`

Features:
- ✅ PayPal email configuration
- ✅ Inline editing with save/cancel
- ✅ Empty state display
- ✅ Payout fee information
- ✅ Email validation

**Backend Integration:**
- PayPal email stored in `user_profiles.paypal_email`
- Saved via `upsertUserProfile()`

## 🔄 Data Flow

```
Settings Page
    ↓
userService.js
    ↓
Supabase
    ↓
- auth.users (authentication)
- user_profiles (profile data)
- avatars bucket (avatar images)
```

## 🎯 How It Works

### On Page Load:
1. `getCurrentUser()` fetches authenticated user
2. Loads user profile from `user_profiles` table
3. Populates all form fields with existing data
4. Loads avatar URL from profile

### On Save:
1. Validates email change (if any)
2. Updates email via Supabase Auth (sends verification)
3. Saves all profile data to `user_profiles` table
4. Includes notification preferences and PayPal email
5. Shows success/error messages

### Avatar Upload:
1. Validates file type and size
2. Uploads to Supabase Storage `avatars` bucket
3. Gets public URL
4. Updates `avatar_url` in user profile
5. Displays new avatar immediately

### Password Update:
1. Validates password fields
2. Checks password match
3. Updates via Supabase Auth
4. Clears form on success

## 📊 Database Schema

### user_profiles Table:
```sql
- id (UUID) - Primary key
- user_id (UUID) - Foreign key to auth.users
- display_name (VARCHAR) - User's display name
- location (VARCHAR) - User's location
- bio (TEXT) - User biography
- avatar_url (TEXT) - Avatar image URL
- paypal_email (VARCHAR) - PayPal email for payouts
- notification_preferences (JSONB) - Notification settings
- created_at (TIMESTAMP) - Profile creation date
- updated_at (TIMESTAMP) - Last update date
```

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own profile
- ✅ Avatar file validation (type and size)
- ✅ Email verification on email change
- ✅ Secure password updates via Supabase Auth
- ✅ JSONB for flexible notification preferences

## 🧪 Testing

After running the migration:

1. **Sign in** to the app
2. Go to **Settings** page
3. Test each section:
   - Update display name
   - Upload an avatar
   - Change email (check for verification email)
   - Update password
   - Toggle notification preferences
   - Add PayPal email
4. Click **Save**
5. Refresh the page - all data should persist

## 🎨 UI Features

- ✅ Loading states while fetching data
- ✅ Saving state during updates
- ✅ Success/error alerts
- ✅ Disabled states during operations
- ✅ Form validation
- ✅ Tooltips for guidance
- ✅ Smooth section navigation
- ✅ Responsive design

## 📝 Notes

- Email updates require verification (user will receive verification email)
- Avatar uploads are limited to 5MB
- Notification preferences use JSONB for flexibility
- Profile is auto-created on user signup via database trigger
- All changes are saved together when clicking the main "Save" button
- Password can be updated independently via "Update password" button

## 🚀 Ready to Use!

Once you've run the database migration and created the avatars bucket, the Settings page is fully functional and connected to your Supabase backend!
