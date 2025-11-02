# Promote Page Backend Integration

## ✅ Completed

The Promote page has been successfully connected to the Supabase PostgreSQL backend!

## What Was Done

### 1. Database Schema
Created three new tables in Supabase:

- **`social_posts`** - Stores social media posts with the following fields:
  - Basic info: title, content, image_url, post_type (picture/video)
  - Platforms: JSON array of social media platforms (facebook, twitter, etc.)
  - Metrics: people_reached, engagement_rate, comments_count, link_clicks, views
  - Status: draft, published, scheduled
  - Timestamps: created_at, updated_at, published_at

- **`social_post_analytics`** - Daily analytics breakdown per post:
  - Daily metrics: views, link_clicks, comments, shares, likes
  - Engagement rate tracking
  - Date-based tracking for historical trends

- **`promotion_insights`** - Aggregated metrics over time periods:
  - Period-based summaries (7 days, month, all time)
  - Aggregated engagement metrics

### 2. Backend Service
Created `src/services/promotionService.js` with functions for:

**Post Management:**
- `getAllPosts(options)` - Fetch all posts with filters
- `getPostById(id)` - Get single post details
- `createPost(postData)` - Create new social media post
- `updatePost(id, updates)` - Update existing post
- `deletePost(id)` - Delete a post
- `getPostsByPeriod(period)` - Filter posts by time period

**Analytics & Insights:**
- `getPromotionInsights(period)` - Get aggregated metrics
- `getDetailedInsights(period)` - Get insights with trend comparison
- `updatePostMetrics(postId, metrics)` - Update post performance metrics
- `getPostAnalytics(postId)` - Get daily analytics for a post
- `addPostAnalytics(postId, analytics)` - Add daily analytics entry

**Utility Functions:**
- `formatNumber(num)` - Format numbers (e.g., 256000 → 256k)
- `formatEngagementRate(rate)` - Format engagement rate (e.g., 1.2 → 1.2x)

### 3. Frontend Components Updated

**Overview Component** (`src/screens/Promote/Overview/index.js`):
- ✅ Fetches real-time insights from backend
- ✅ Displays metrics: people reached, engagement, comments, link clicks
- ✅ Shows percentage change vs previous period
- ✅ Updates dynamically when time period changes
- ✅ Loading states implemented

**RecentPost Component** (`src/screens/Promote/RecentPost/index.js`):
- ✅ Fetches posts from database instead of mock data
- ✅ Filters by time period (Last 7 days, This month, All time)
- ✅ Transforms backend data to UI format
- ✅ Refreshes when new posts are created
- ✅ Loading and empty states

**NewPost Component** (`src/screens/Promote/RecentPost/NewPost/index.js`):
- ✅ Full form functionality to create posts
- ✅ Platform selection (Facebook, Twitter) with visual feedback
- ✅ Image/video upload support
- ✅ Form validation
- ✅ Error handling and loading states
- ✅ Refreshes posts list after creation

### 4. Sample Data
Seeded the database with 5 sample posts and 35 analytics records for testing.

## Database Tables Summary

```sql
social_posts
├── id (UUID, primary key)
├── user_id (UUID, references auth.users)
├── title (TEXT)
├── content (TEXT)
├── image_url (TEXT)
├── post_type (VARCHAR: picture, video, text)
├── status (VARCHAR: draft, published, scheduled)
├── platforms (JSONB array)
├── people_reached (INTEGER)
├── engagement_rate (DECIMAL)
├── comments_count (INTEGER)
├── link_clicks (INTEGER)
├── views (INTEGER)
├── distribution_rate (DECIMAL)
├── scheduled_at (TIMESTAMP)
├── published_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

social_post_analytics
├── id (UUID, primary key)
├── post_id (UUID, references social_posts)
├── date (DATE)
├── views (INTEGER)
├── link_clicks (INTEGER)
├── comments (INTEGER)
├── shares (INTEGER)
├── likes (INTEGER)
├── engagement_rate (DECIMAL)
└── created_at (TIMESTAMP)

promotion_insights
├── id (UUID, primary key)
├── user_id (UUID, references auth.users)
├── period_start (DATE)
├── period_end (DATE)
├── people_reached (INTEGER)
├── engagement_rate (DECIMAL)
├── total_comments (INTEGER)
├── total_link_clicks (INTEGER)
├── total_views (INTEGER)
├── posts_count (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Row Level Security (RLS)

Current RLS policies:
- ✅ **Read access**: All users can view posts (for demo purposes)
- ✅ **Write access**: Only authenticated users can create posts
- ✅ **Update/Delete**: Users can only modify their own posts

## How to Use

### View Posts and Insights
1. Navigate to the Promote page in your app
2. The Overview section will show aggregated insights
3. The Recent Posts section will display all posts
4. Use the dropdown to filter by time period (Last 7 days, This month, All time)

### Create a New Post
1. Click the "New post" button
2. Select social media platforms (click to toggle)
3. Enter post title and content
4. Optionally upload an image or video
5. Click "Post" to publish

### Time Period Filtering
The page supports three time periods:
- **Last 7 days** - Shows data from the past week
- **This month** - Shows data from the past 30 days
- **All time** - Shows all historical data

## Sample Data Overview

The database has been seeded with:
- 5 sample social media posts
- 35 analytics records (7 days × 5 posts)
- Posts from the last 6 days with realistic metrics

Sample metrics included:
- People reached: 92k - 256k
- Engagement rates: 0.9x - 1.9x
- Link clicks: 45 - 156
- Views: 980 - 2,100
- Comments: 54 - 128

## Next Steps (Optional Enhancements)

### 1. File Upload to Supabase Storage
Currently, file uploads create local URLs. To implement real file storage:

```javascript
// In src/screens/Promote/RecentPost/NewPost/index.js
const handleFileUpload = async (e, fileType) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { data, error } = await supabase.storage
    .from('social-posts')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    return;
  }

  const { data: publicUrl } = supabase.storage
    .from('social-posts')
    .getPublicUrl(filePath);

  setPostData(prev => ({
    ...prev,
    image_url: publicUrl.publicUrl,
    post_type: fileType === 'video-stroke' ? 'video' : 'picture'
  }));
};
```

### 2. Real-time Updates
Add real-time subscriptions to see posts update live:

```javascript
// In src/screens/Promote/RecentPost/index.js
useEffect(() => {
  const subscription = supabase
    .channel('social_posts')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'social_posts' },
      (payload) => {
        console.log('Change received!', payload);
        fetchPosts(); // Refresh posts
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. Pagination
Implement proper pagination for the "Load more" button:

```javascript
const [offset, setOffset] = useState(0);
const limit = 10;

const handleLoadMore = async () => {
  setLoadingMore(true);
  const newOffset = offset + limit;

  const { data, error } = await getAllPosts({
    limit,
    offset: newOffset
  });

  if (!error && data) {
    setPosts(prev => [...prev, ...transformedPosts]);
    setOffset(newOffset);
  }

  setLoadingMore(false);
};
```

### 4. Post Editing
Add functionality to edit existing posts by implementing an edit modal similar to NewPost.

### 5. Post Deletion
Add delete functionality with confirmation:

```javascript
const handleDelete = async (postId) => {
  if (window.confirm('Are you sure you want to delete this post?')) {
    const { error } = await deletePost(postId);
    if (!error) {
      fetchPosts(); // Refresh the list
    }
  }
};
```

### 6. Advanced Analytics
- Add charts for trend visualization
- Implement comparison between different time periods
- Add platform-specific analytics

### 7. Scheduled Posts
Implement the scheduling functionality for posts with status='scheduled'.

## Testing

You can test the integration:
1. Start your React app: `npm start` or `yarn start`
2. Navigate to the Promote page
3. You should see the 5 sample posts
4. Try creating a new post using the "New post" button
5. Switch between different time periods to see data filtering

## Troubleshooting

### Posts Not Showing Up
- Check browser console for errors
- Verify Supabase connection in `.env` file
- Check RLS policies in Supabase dashboard

### Cannot Create Posts
- Ensure you're authenticated (RLS requires auth for insert)
- Check browser console for detailed error messages
- Verify the service is imported correctly

### Metrics Show Zero
- The sample data has realistic metrics
- If you create new posts, metrics default to 0
- You can update metrics manually in Supabase or via `updatePostMetrics()`

## Files Modified/Created

**Created:**
- `database-schema-promotion.sql` - Database schema
- `seed-promotion-data-v2.sql` - Sample data
- `src/services/promotionService.js` - Backend service
- `PROMOTE_PAGE_INTEGRATION.md` - This documentation

**Modified:**
- `src/screens/Promote/Overview/index.js` - Connected to backend
- `src/screens/Promote/RecentPost/index.js` - Connected to backend
- `src/screens/Promote/RecentPost/NewPost/index.js` - Full form functionality

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your `.env` configuration
3. Check Supabase dashboard for RLS policy issues
4. Review the service functions in `promotionService.js`

---

🎉 **Your Promote page is now fully integrated with the backend!**
