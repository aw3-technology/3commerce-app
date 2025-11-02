# Shop/Profile Page Backend Integration

The Shop (Profile) page has been successfully connected to the Supabase backend!

## Overview

The Shop page (`/shop`) displays a user's profile with three tabs:
1. **Products** - Published products with ratings
2. **Followers** - Users following this profile
3. **Following** - Users this profile is following

## Components Updated

### 1. Main Shop Page (`src/screens/Shop/index.js`)

**Already Connected** ✅ with enhancements

#### Data Sources:
- `getAllProducts()` from productService
- `getAllCustomers()` from customerService
- `getAllComments()` from commentService (for ratings)

#### Features:
- **Three Tabs**: Products, Followers, Following
- **Sorting Options**: Most recent, Most new, Most popular
- **Pagination**: Load more functionality with 9 items per page
- **Product Ratings**: Calculated from comment/review ratings
- **Loading States**: Spinner and text while fetching data
- **Error Handling**: Error display with retry button
- **Empty States**: Messages when no data available

#### Product Data Structure:
```javascript
{
  id: "uuid",
  product: "Product Name",
  category: "UI design kit",
  image: "/path/to/image.jpg",
  image2x: "/path/to/image@2x.jpg",
  status: true, // published
  price: 98.00,
  sales: 150,
  rating: "4.5", // average rating from comments
  ratingCount: 23, // number of ratings
  // Additional fields for compatibility
  balance: 0,
  views: 0,
  viewsPercent: 0,
  likesPercent: 0,
  likes: 0
}
```

#### Follower/Following Data Structure:
```javascript
{
  id: "uuid",
  name: "Customer Name",
  avatar: "/path/to/avatar.jpg",
  code: "customer@email.com",
  category: "Customer",
  products: 5, // order_count from customer
  followers: 0, // placeholder
  gallery: [] // placeholder for product gallery
}
```

### 2. Profile Component (`src/screens/Shop/Profile/index.js`)

**Already Connected** ✅

#### Data Source:
- `getCurrentUser()` from userService

#### Features:
- Displays user profile information
- Avatar display
- Display name from profile or email fallback
- Bio text
- Social media links (Twitter, Instagram, Pinterest)
- Loading and error states
- Retry functionality on error

#### Profile Data Structure:
```javascript
{
  email: "user@example.com",
  profile: {
    display_name: "John Doe",
    bio: "Product designer and creator",
    avatar_url: "/path/to/avatar.jpg",
    social_twitter: "https://twitter.com/username",
    social_instagram: "https://instagram.com/username",
    social_pinterest: "https://pinterest.com/username"
  }
}
```

### 3. Follower Component (`src/screens/Shop/Follower/index.js`)

**Updated** ✅

#### Features:
- Displays follower/following user information
- Shows product count and follower count
- Follow/Unfollow button with state management
- Message button linking to message center
- Optional product gallery
- Proper fallbacks for missing data
- Singular/plural text handling

## Rating Calculation

Products now display real ratings calculated from comments:

### How It Works:
1. Fetch all comments when loading products
2. Group comments by `product_id`
3. Calculate average rating for each product
4. Count total number of ratings
5. Display rating and count (e.g., "4.5 (23 ratings)")

### Formula:
```javascript
Average Rating = Sum of all ratings / Number of ratings
```

### Display Logic:
- If product has ratings: Show average (e.g., "4.5")
- If no ratings: Show "No ratings"

## Data Flow

```
Database (Supabase)
    ↓
Services (productService, customerService, commentService, userService)
    ↓
Shop Component State (React useState)
    ↓
Child Components (Profile, Product, Follower)
    ↓
UI Display
```

## Backend Services Used

### productService.js
- `getAllProducts(options)` - Get published products with filtering

### customerService.js
- `getAllCustomers(options)` - Get customers for followers/following

### commentService.js
- `getAllComments(options)` - Get comments/reviews for rating calculation

### userService.js
- `getCurrentUser()` - Get authenticated user with profile data

## Features Implemented

✅ **Products Tab**
- Fetch published products from database
- Display product ratings from comments
- Sort by: Most recent, Most new, Most popular
- Pagination with "Load more" (9 per page)
- Product images, names, categories, prices
- Empty state when no products

✅ **Followers Tab**
- Fetch customers as followers
- Display avatar, name, product count
- Follow/Following button with toggle
- Message button
- Empty state when no followers

✅ **Following Tab**
- Fetch customers as following
- Display user information
- Unfollow button
- Message button
- Empty state when not following anyone

✅ **Profile Section**
- Display user avatar
- Show display name or email
- Bio text
- Social media icons with links
- Follow button
- Loading and error states

✅ **General Features**
- Real-time data from Supabase
- Loading spinners
- Error handling with retry
- Empty states for all tabs
- Responsive design
- Item count display

## Testing

### Test the Shop Page

1. **Navigate to `/shop`**
2. **Verify Profile Section**:
   - Check avatar loads
   - Verify display name or email shows
   - Check bio text
   - Verify social media links (if configured)

3. **Test Products Tab**:
   - Verify products load from database
   - Check images, names, prices display
   - Verify ratings show (or "No ratings")
   - Test sorting dropdown (Most recent, Most new, Most popular)
   - Click "Load more" to test pagination

4. **Test Followers Tab**:
   - Switch to Followers tab
   - Verify customer data displays
   - Check avatars, names, product counts
   - Test Follow/Following button toggle
   - Click Message button

5. **Test Following Tab**:
   - Switch to Following tab
   - Verify following list displays
   - Test Unfollow button
   - Test Message button

## Sample SQL for Testing

### Create User Profile
```sql
-- Create user_profiles table if not exists
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    social_twitter TEXT,
    social_instagram TEXT,
    social_pinterest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test profile
INSERT INTO user_profiles (user_id, display_name, bio, avatar_url)
VALUES (
    auth.uid(),
    'John Doe',
    'Product designer and creator',
    '/images/content/avatar.jpg'
);
```

### Create Products with Ratings
```sql
-- Insert test products
INSERT INTO products (name, description, price, category, status, image_url, sales_count)
VALUES
  ('Bento Matte 3D Illustration', 'Beautiful 3D illustrations', 98.00, '3D Icons', 'published', '/images/content/product-pic-1.jpg', 45),
  ('Node - Crypto iOS UI design kit', 'Complete crypto app UI', 98.00, 'UI Design Kit', 'published', '/images/content/product-pic-2.jpg', 32),
  ('Academe 3D Education Icons', 'Education icon pack', 48.00, '3D Icons', 'published', '/images/content/product-pic-3.jpg', 78),
  ('Fleet - Travel shopping UI design kit', 'Travel app design', 98.00, 'UI Design Kit', 'published', '/images/content/product-pic-4.jpg', 56);

-- Insert test comments/ratings
INSERT INTO comments (product_id, customer_id, rating, comment)
SELECT
  p.id,
  (SELECT id FROM customers LIMIT 1),
  (RANDOM() * 2 + 3)::INTEGER, -- Random rating 3-5
  'Great product!'
FROM products p
WHERE p.status = 'published';
```

## Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    social_twitter TEXT,
    social_instagram TEXT,
    social_pinterest TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Customization

### Change Items Per Page
Edit `ITEMS_PER_PAGE` constant in `src/screens/Shop/index.js`:
```javascript
const ITEMS_PER_PAGE = 9; // Change to desired number
```

### Modify Sorting Options
Edit `intervals` array in `src/screens/Shop/index.js`:
```javascript
const intervals = ["Most recent", "Most new", "Most popular"];
```

### Update Social Media Icons
Add more social platforms in `src/screens/Shop/Profile/index.js`:
```javascript
if (user.profile.social_linkedin) {
  socials.push({
    title: "linkedin",
    url: user.profile.social_linkedin,
  });
}
```

## Integration with Other Features

### Product Ratings Flow
1. Customer leaves review via Comments page
2. Review includes rating (1-5 stars)
3. Shop page calculates average rating
4. Rating displays on product cards

### Followers/Following System
Currently uses customers as placeholder data. To implement a real follow system:

1. **Create followers table**:
```sql
CREATE TABLE followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES auth.users(id),
    following_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);
```

2. **Create follower service functions**:
```javascript
export const followUser = async (followingId) => {
  // Implementation
};

export const unfollowUser = async (followingId) => {
  // Implementation
};

export const getFollowers = async (userId) => {
  // Implementation
};

export const getFollowing = async (userId) => {
  // Implementation
};
```

3. **Update Shop component** to use follower service

## Troubleshooting

### Products not showing
- Verify products exist with `status = 'published'`
- Check that `getAllProducts()` service is working
- Ensure products have valid `image_url` and `price`

### Ratings not appearing
- Check that comments table has data
- Verify comments have `product_id` and `rating` fields
- Ensure `getAllComments()` service is working

### Profile not loading
- Verify user is authenticated
- Check that `user_profiles` table exists
- Ensure user profile data exists in database

### Followers/Following empty
- This is expected if using customers as placeholder
- Implement proper followers system (see Integration section)
- Verify customers exist in database

### Social links not showing
- Check that profile has social URLs configured
- Verify URLs are complete (include https://)
- Ensure icon names match Icon component

## Next Steps

Consider these enhancements:

1. **Implement Real Follow System**
   - Create followers table
   - Add follow/unfollow functionality
   - Track follower counts
   - Show real followers/following

2. **Product Gallery for Followers**
   - Fetch user's products
   - Display thumbnail gallery
   - Link to product pages

3. **Enhanced Ratings**
   - Display star icons instead of numbers
   - Show rating distribution (5⭐, 4⭐, etc.)
   - Add review count to product cards

4. **User Statistics**
   - Total products count
   - Total sales
   - Member since date
   - Verified badge

5. **Advanced Filtering**
   - Filter products by category
   - Price range filter
   - Search functionality

6. **Profile Customization**
   - Cover photo
   - Custom bio formatting
   - Links section
   - Featured products

7. **Activity Feed**
   - Recent uploads
   - Recent reviews
   - Recent purchases

8. **Privacy Settings**
   - Hide follower count
   - Private profile option
   - Block users functionality

## Performance Optimization

### Current Implementation
- Fetches all comments for rating calculation
- Could be slow with many comments

### Recommended Improvements

1. **Add rating fields to products table**:
```sql
ALTER TABLE products
ADD COLUMN average_rating DECIMAL(2,1),
ADD COLUMN rating_count INTEGER DEFAULT 0;
```

2. **Update ratings with triggers**:
```sql
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    average_rating = (
      SELECT AVG(rating)
      FROM comments
      WHERE product_id = NEW.product_id
      AND rating IS NOT NULL
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM comments
      WHERE product_id = NEW.product_id
      AND rating IS NOT NULL
    )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_comment
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();
```

3. **Use cached ratings in query**:
```javascript
const transformedData = data?.map((product) => ({
  // ... other fields
  rating: product.average_rating,
  ratingCount: product.rating_count,
}));
```

This eliminates the need to fetch all comments every time!
