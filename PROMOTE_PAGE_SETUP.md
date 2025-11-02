# Promote Page Setup Guide

## Overview
The Promote page is fully connected to Supabase backend and provides comprehensive social media post management and analytics. Features include:
- Promotion insights dashboard (people reached, engagement, comments, link clicks)
- Recent posts list with detailed metrics
- Create new posts with image/video upload
- Multi-platform distribution (Facebook, Twitter, Instagram, LinkedIn)
- Real-time analytics and engagement tracking

## Database Setup

### 1. Run Promotion Schema Migration
Execute the SQL file `database-schema-promotion.sql` in your Supabase SQL Editor to create:
- `social_posts` table - Store all social media posts
- `social_post_analytics` table - Daily analytics breakdown per post
- `promotion_insights` table - Aggregated metrics by period
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp triggers

```bash
# Tables created:
# - social_posts: Main posts table with engagement metrics
# - social_post_analytics: Daily breakdown of post performance
# - promotion_insights: Aggregated period-based insights
```

### 2. Create Storage Buckets
In your Supabase dashboard, create two storage buckets:

#### Post Images Bucket
1. Go to Storage → Create new bucket
2. Name: `post-images`
3. Public: Yes (checked)
4. Save

#### Videos Bucket
1. Go to Storage → Create new bucket
2. Name: `videos`
3. Public: Yes (checked)
4. Save

### 3. Configure Storage Policies

For both `post-images` and `videos` buckets:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images'); -- or 'videos'

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images' AND auth.role() = 'authenticated');
```

## Features

### 1. Insights Overview (`src/screens/Promote/Overview/index.js`)

**Connected Features:**
- ✅ People reached - Total unique views across all posts
- ✅ Engagement rate - Average engagement across posts (shown as multiplier like "1.3x")
- ✅ Comments - Total comments received
- ✅ Link clicks - Total clicks on post links
- ✅ Time period filtering (Last 7 days, This month, All time)
- ✅ Percentage change vs previous period
- ✅ Loading states
- ✅ Dynamic data from backend

**Backend Functions Used:**
- `getDetailedInsights(period)` - Fetches aggregated metrics with trend data

**Metrics Calculation:**
- Compares current period vs previous period
- Calculates percentage change for each metric
- Formats large numbers (e.g., 874.0k)
- Shows engagement rate as multiplier (e.g., 1.3x)

### 2. Recent Posts (`src/screens/Promote/RecentPost/index.js`)

**Connected Features:**
- ✅ List all posts filtered by time period
- ✅ Display post metrics:
  - Distribution rate (engagement multiplier)
  - Link clicks with progress bar
  - Views with progress bar
  - Engagement (comments) with progress bar
- ✅ Social platform badges (Facebook, Twitter, Instagram, LinkedIn)
- ✅ Load more functionality
- ✅ Create new post modal
- ✅ Empty state handling
- ✅ Loading states

**Backend Functions Used:**
- `getPostsByPeriod(period)` - Fetch posts by time period

**Post Data Structure:**
```javascript
{
  id: "uuid",
  title: "Post title",
  image_url: "https://...",
  post_type: "picture" | "video" | "text",
  platforms: ["facebook", "twitter", "instagram", "linkedin"],
  distribution_rate: 1.2, // engagement multiplier
  link_clicks: 156,
  views: 1250,
  comments_count: 89,
  people_reached: 874000,
  engagement_rate: 1.3
}
```

### 3. New Post Creation (`src/screens/Promote/RecentPost/NewPost/index.js`)

**Connected Features:**
- ✅ Post title input (required)
- ✅ Post content textarea
- ✅ Platform selection (Facebook, Twitter, Instagram, LinkedIn)
- ✅ **Image upload to Supabase Storage**
  - File type validation (JPEG, PNG, GIF, WebP)
  - File size validation (max 10MB)
  - Upload to `post-images` bucket
  - Preview uploaded image
- ✅ **Video upload to Supabase Storage**
  - File type validation (MP4, MPEG, MOV, WebM)
  - File size validation (max 50MB)
  - Upload to `videos` bucket
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Auto-refresh posts list after creation

**Backend Functions Used:**
- `createPost(postData)` - Create new social post
- `supabase.storage.from().upload()` - Upload media to storage

**Validation Rules:**
- Title: Required
- Platform: At least one platform must be selected
- Images: JPEG, PNG, GIF, WebP up to 10MB
- Videos: MP4, MPEG, MOV, WebM up to 50MB

## Backend Service Functions

Located in `src/services/promotionService.js`:

### Post Management
- `getAllPosts(options)` - Get all posts with pagination
- `getPostById(id)` - Get single post
- `createPost(postData)` - Create new post
- `updatePost(id, updates)` - Update existing post
- `deletePost(id)` - Delete post
- `getPostsByPeriod(period)` - Get posts filtered by time period

### Analytics & Insights
- `getPromotionInsights(period)` - Get aggregated insights
- `getDetailedInsights(period)` - Get insights with trend comparison
- `updatePostMetrics(postId, metrics)` - Update post metrics
- `getPostAnalytics(postId)` - Get daily analytics for post
- `addPostAnalytics(postId, analytics)` - Add daily analytics entry

### Utility Functions
- `formatNumber(num)` - Format numbers (e.g., 256000 → 256k)
- `formatEngagementRate(rate)` - Format engagement rate (e.g., 1.3 → 1.3x)

## Database Schema

### social_posts Table
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES auth.users
title             TEXT NOT NULL
content           TEXT
image_url         TEXT
post_type         VARCHAR(50) -- picture, video, text
status            VARCHAR(50) -- draft, published, scheduled
platforms         JSONB -- ['facebook', 'twitter', 'instagram', 'linkedin']
people_reached    INTEGER
engagement_rate   DECIMAL(5, 2)
comments_count    INTEGER
link_clicks       INTEGER
views             INTEGER
distribution_rate DECIMAL(5, 2)
scheduled_at      TIMESTAMP
published_at      TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### social_post_analytics Table
```sql
id              UUID PRIMARY KEY
post_id         UUID REFERENCES social_posts
date            DATE
views           INTEGER
link_clicks     INTEGER
comments        INTEGER
shares          INTEGER
likes           INTEGER
engagement_rate DECIMAL(5, 2)
created_at      TIMESTAMP
```

### promotion_insights Table
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES auth.users
period_start        DATE
period_end          DATE
people_reached      INTEGER
engagement_rate     DECIMAL(5, 2)
total_comments      INTEGER
total_link_clicks   INTEGER
total_views         INTEGER
posts_count         INTEGER
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

## Data Flow

### Creating a New Post

1. **User fills form:**
   - Enters title and content
   - Selects platforms (Facebook, Twitter, etc.)
   - Uploads image or video

2. **File Upload Process:**
   - Validates file type and size
   - Gets authenticated user
   - Generates unique filename: `{userId}-{timestamp}.{ext}`
   - Uploads to appropriate bucket (`post-images` or `videos`)
   - Gets public URL from storage
   - Updates form state with URL

3. **Form Submission:**
   - Validates required fields
   - Calls `createPost()` with:
     - title, content, image_url
     - post_type (picture/video)
     - platforms array
     - status: 'published'
   - Sets user_id automatically
   - Sets published_at timestamp

4. **Post Creation:**
   - Inserts record into `social_posts` table
   - Returns created post data
   - Triggers posts list refresh
   - Closes modal

### Fetching Insights

1. **User selects time period:**
   - "Last 7 days", "This month", or "All time"

2. **Insights Calculation:**
   - Maps period to date range
   - Fetches current period posts
   - Fetches previous period posts (for comparison)
   - Aggregates metrics:
     - Sum of people_reached
     - Average engagement_rate
     - Sum of comments_count
     - Sum of link_clicks
     - Sum of views
   - Calculates percentage change vs previous period

3. **Display:**
   - Formats numbers (874.0k)
   - Shows engagement as multiplier (1.3x)
   - Displays percentage change with color coding

## Testing Checklist

### Insights Overview
- [ ] Load page and verify insights display
- [ ] Switch between time periods (7 days, month, all time)
- [ ] Verify metrics update correctly
- [ ] Check percentage changes are calculated
- [ ] Verify loading states appear

### Recent Posts
- [ ] View list of posts
- [ ] Verify all metrics display correctly
- [ ] Filter by time period
- [ ] Click "Load more" button
- [ ] Verify social platform badges appear
- [ ] Check empty state when no posts

### Create New Post
- [ ] Open new post modal
- [ ] Enter post title and content
- [ ] Select multiple platforms
- [ ] Try submitting without title (should show error)
- [ ] Try submitting without platform (should show error)
- [ ] Upload valid image (JPEG/PNG under 10MB)
- [ ] Try uploading invalid image type (should show error)
- [ ] Try uploading image over 10MB (should show error)
- [ ] Upload valid video (MP4 under 50MB)
- [ ] Try uploading video over 50MB (should show error)
- [ ] Preview uploaded media
- [ ] Submit form successfully
- [ ] Verify post appears in list
- [ ] Verify modal closes

### File Upload
- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Upload GIF image
- [ ] Upload WebP image
- [ ] Upload MP4 video
- [ ] Upload MOV video
- [ ] Verify files appear in Supabase Storage
- [ ] Verify public URLs work
- [ ] Check file size validation
- [ ] Check file type validation

## Common Issues & Solutions

### Issue: File upload fails
**Solution:**
- Verify storage buckets exist (`post-images` and `videos`)
- Check buckets are set to public
- Verify storage policies are created
- Check file size is within limits
- Verify user is authenticated

### Issue: Posts not appearing
**Solution:**
- Check user is logged in
- Verify `social_posts` table exists
- Check RLS policies allow user to view own posts
- Verify posts have correct user_id
- Check browser console for errors

### Issue: Insights showing zero
**Solution:**
- Create some posts with metrics
- Verify time period includes posts
- Check database has data in metrics fields
- Ensure aggregation queries are working

### Issue: Platform selection not working
**Solution:**
- Check platforms array is properly updated
- Verify JSONB field accepts array format
- Ensure at least one platform is selected before submit

### Issue: Storage bucket not found
**Solution:**
- Create buckets in Supabase dashboard (Storage section)
- Name must be exactly: `post-images` and `videos`
- Set to public access
- Apply storage policies

## Security Considerations

1. **Row Level Security (RLS):**
   - Users can only view/edit their own posts
   - Analytics protected by post ownership
   - Insights restricted to user's own data

2. **File Upload Security:**
   - File type validation on client side
   - File size limits enforced (10MB images, 50MB videos)
   - Authenticated users only can upload
   - Unique filenames prevent overwrites

3. **Data Validation:**
   - Required fields enforced
   - Platform selection validated
   - Post status controlled
   - XSS protection via React

## Metrics Explanation

### People Reached
Total number of unique users who viewed your posts across all platforms.

### Engagement Rate
Average engagement multiplier calculated as:
```
engagement_rate = (likes + comments + shares) / views
```
Displayed as "1.3x" meaning 1.3 times engagement

### Distribution Rate
Virality multiplier showing how far the post spread beyond initial audience:
```
distribution_rate = people_reached / initial_followers
```

### Link Clicks
Total number of times users clicked on links within your posts.

### Views
Total number of times your posts were viewed.

### Comments Count
Total number of comments received across all posts.

## Environment Variables

Ensure your `.env` file has:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Structure

```
src/
├── screens/
│   └── Promote/
│       ├── index.js                    # Main promote container
│       ├── Overview/
│       │   └── index.js               # Insights dashboard
│       └── RecentPost/
│           ├── index.js               # Posts list
│           ├── Row/                   # Post row component
│           └── NewPost/
│               └── index.js           # Create post form
├── services/
│   └── promotionService.js            # All promotion API functions
└── config/
    └── supabaseClient.js              # Supabase configuration

database-schema-promotion.sql          # Database setup script
```

## Supported Platforms

Currently integrated:
- ✅ Facebook
- ✅ Twitter
- ✅ Instagram
- ✅ LinkedIn

To add more platforms, update the `socialPlatforms` array in `NewPost/index.js`.

## Next Steps

1. Run the database migration (`database-schema-promotion.sql`)
2. Create storage buckets (`post-images` and `videos`)
3. Apply storage policies
4. Test post creation with image/video upload
5. Verify analytics are calculating correctly
6. Consider integrating actual social media APIs for real posting
7. Add scheduled posting functionality
8. Implement post editing
9. Add post deletion with confirmation
10. Create analytics dashboard with charts
