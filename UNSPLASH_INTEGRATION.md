# Unsplash API Integration Documentation

## Overview

This document describes the Unsplash integration for 3Commerce, providing access to millions of high-quality, free stock images for product listings and store content.

## Table of Contents

1. [Setup](#setup)
2. [Features](#features)
3. [Usage Guide](#usage-guide)
4. [API Reference](#api-reference)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Environment Configuration

The Unsplash API credentials are stored in your `.env` file:

```env
REACT_APP_UNSPLASH_ACCESS_KEY=KrY-tw64HNRZrSMkRdf-6HqCR_xyVCkH1tbvfZ4faPc
REACT_APP_UNSPLASH_SECRET_KEY=OMaySvNUoTBOAYsEHRupI74nczUCIcCXHdD9RBv_O3s
REACT_APP_UNSPLASH_APPLICATION_ID=825626
```

**To get your API credentials:**
1. Create an account at [Unsplash Developers](https://unsplash.com/developers)
2. Register a new application
3. Copy your Access Key, Secret Key, and Application ID
4. Add them to your `.env` file

### 2. Test the Connection

1. Navigate to **Settings → Integrations**
2. Scroll to **Unsplash Integration** section
3. Click "Test Connection" button
4. Verify that the connection status shows "Connected"

---

## Features

### 1. Image Browser

**Location:** New Product page → Images & CTA section

Users can:
- Browse curated collections of high-quality photos
- Search by keywords (e.g., "business", "technology", "nature")
- Filter by orientation (landscape, portrait, square)
- Browse popular categories
- Load more images with infinite scroll
- Automatic photographer attribution

### 2. Search & Discovery

- **Keyword Search**: Search for specific subjects or themes
- **Popular Categories**: Quick access to trending topics
- **Curated Collections**: Hand-picked photos from Unsplash editors
- **Trending Photos**: Most popular images on Unsplash

### 3. Automatic Attribution

When an Unsplash image is selected:
- Photographer name and link automatically added
- "Photo by [Name] on Unsplash" attribution displayed
- Download tracking (required by Unsplash API guidelines)
- No manual attribution management needed

---

## Usage Guide

### Using Unsplash Images in Products

1. **Navigate to New Product**
   - Go to the "New Product" page
   - Scroll to "Images & CTA" section

2. **Browse Unsplash**
   - Click "Browse Unsplash Images" button
   - A modal will open with the image browser

3. **Search for Images**
   - Use the search bar to find specific images
   - Try popular categories for quick browsing
   - Filter by orientation if needed

4. **Select an Image**
   - Click on any image to select it
   - The image and attribution are automatically added
   - Preview appears in the product form

5. **Publish Product**
   - Complete other product details
   - Click "Publish" to make the product live
   - Attribution is displayed with the product

### Switching Between Upload and Unsplash

You can switch between uploading your own images and using Unsplash:

- **Upload**: Click "Click or drop image" to upload from your computer
- **Unsplash**: Click "Browse Unsplash Images" to search Unsplash
- Selecting one option replaces the other
- Attribution is only shown for Unsplash images

---

## API Reference

### Service Functions

#### Search Photos

```javascript
import { searchPhotos } from './services/unsplashService';

const { data, error } = await searchPhotos('mountains', {
  page: 1,
  per_page: 30,
  orientation: 'landscape', // 'landscape', 'portrait', 'squarish'
  color: 'blue' // optional color filter
});

if (!error) {
  const photos = data.results;
  console.log(`Found ${data.total} photos`);
}
```

#### Get Curated Photos

```javascript
import { getPhotos } from './services/unsplashService';

const { data, error } = await getPhotos({
  page: 1,
  per_page: 30,
  order_by: 'popular' // 'latest', 'oldest', 'popular'
});

if (!error) {
  console.log('Curated photos:', data);
}
```

#### Get Random Photos

```javascript
import { getRandomPhotos } from './services/unsplashService';

const { data, error } = await getRandomPhotos({
  count: 10,
  query: 'nature',
  orientation: 'landscape'
});

if (!error) {
  console.log('Random photos:', data);
}
```

#### Get Collections

```javascript
import { getCollections, getCollectionPhotos } from './services/unsplashService';

// Get all collections
const { data: collections } = await getCollections({ per_page: 30 });

// Get photos from a specific collection
const { data: photos } = await getCollectionPhotos(collectionId, {
  per_page: 30,
  orientation: 'landscape'
});
```

#### Get Topics

```javascript
import { getTopics, getTopicPhotos } from './services/unsplashService';

// Get all topics
const { data: topics } = await getTopics({
  per_page: 30,
  order_by: 'featured' // 'featured', 'latest', 'oldest'
});

// Get photos from a specific topic
const { data: photos } = await getTopicPhotos('business-work', {
  per_page: 30
});
```

#### Track Downloads (Required!)

**IMPORTANT**: You must call this when a user uses an image, per Unsplash API guidelines.

```javascript
import { trackPhotoDownload } from './services/unsplashService';

// Get download_location from the photo object
const downloadLocation = photo.links.download_location;

// Track the download
const { success, error } = await trackPhotoDownload(downloadLocation);

if (success) {
  console.log('Download tracked successfully');
}
```

### Helper Functions

#### Get Photo URL

```javascript
import { getPhotoUrl } from './services/unsplashService';

const photo = { /* photo object from API */ };

// Get different sizes
const rawUrl = getPhotoUrl(photo, 'raw');       // Original size
const fullUrl = getPhotoUrl(photo, 'full');     // Full size (max 6000px)
const regularUrl = getPhotoUrl(photo, 'regular'); // Regular (1080px)
const smallUrl = getPhotoUrl(photo, 'small');   // Small (400px)
const thumbUrl = getPhotoUrl(photo, 'thumb');   // Thumbnail (200px)
```

#### Get Attribution

```javascript
import { getPhotoAttribution } from './services/unsplashService';

const attribution = getPhotoAttribution(photo);

console.log(attribution);
// {
//   photographerName: "John Doe",
//   photographerUsername: "johndoe",
//   photographerUrl: "https://unsplash.com/@johndoe",
//   unsplashUrl: "https://unsplash.com/photos/abc123",
//   attributionText: "Photo by John Doe on Unsplash"
// }
```

### Constants

#### Popular Categories

```javascript
import { POPULAR_CATEGORIES } from './services/unsplashService';

console.log(POPULAR_CATEGORIES);
// ['business', 'technology', 'food', 'nature', 'fashion', ...]
```

#### Orientations

```javascript
import { ORIENTATIONS } from './services/unsplashService';

const filters = {
  orientation: ORIENTATIONS.LANDSCAPE  // null, 'landscape', 'portrait', 'squarish'
};
```

#### Colors

```javascript
import { COLORS } from './services/unsplashService';

const filters = {
  color: COLORS.BLUE  // null, 'black_and_white', 'black', 'white', etc.
};
```

---

## Best Practices

### 1. Attribution

**Always include attribution** for Unsplash images:
- Use the provided attribution helper function
- Display "Photo by [Name] on Unsplash"
- Link to photographer's profile and Unsplash
- This is automatically handled by the integration

### 2. Download Tracking

**Always track downloads** when an image is used:
- Call `trackPhotoDownload()` when user selects an image
- This is required by Unsplash API guidelines
- Automatically handled by the UnsplashBrowser component
- Failure to track may result in API access revocation

### 3. Search Optimization

For better search results:
- Use specific, descriptive keywords
- Try multiple variations of search terms
- Use popular categories for quick browsing
- Filter by orientation for better results

### 4. Image Selection

Choose appropriate images:
- Match image orientation to your layout
- Consider image colors and composition
- Check image quality and resolution
- Preview image before publishing

### 5. API Rate Limits

Unsplash has rate limits:
- **50 requests per hour** (Demo/Development)
- **5000 requests per hour** (Production)

To stay within limits:
- Cache search results
- Implement pagination
- Use popular categories to reduce searches
- Monitor API usage in Unsplash dashboard

### 6. License Compliance

Follow the [Unsplash License](https://unsplash.com/license):
- ✅ Free to use for commercial and non-commercial purposes
- ✅ No permission needed from photographer or Unsplash
- ✅ Attribution appreciated but not required
- ❌ Don't sell unmodified photos
- ❌ Don't compile into a competing service
- ❌ Don't use in offensive or harmful ways

---

## Troubleshooting

### Connection Issues

**Problem:** "Connection Failed" in Settings

**Solutions:**
1. Verify API credentials in `.env` file:
   ```bash
   # Check that these exist and are correct:
   REACT_APP_UNSPLASH_ACCESS_KEY=your_access_key
   REACT_APP_UNSPLASH_SECRET_KEY=your_secret_key
   REACT_APP_UNSPLASH_APPLICATION_ID=your_app_id
   ```

2. Restart your development server:
   ```bash
   npm start
   ```

3. Check API status:
   - Visit [Unsplash Status](https://status.unsplash.com/)
   - Verify your application in [Unsplash Dashboard](https://unsplash.com/oauth/applications)

### Images Not Loading

**Problem:** Photos don't appear in browser

**Solutions:**
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check API rate limits in Unsplash dashboard
4. Try a different search term or category

### Rate Limit Exceeded

**Problem:** "Rate limit exceeded" error

**Solutions:**
1. Wait for the rate limit to reset (hourly)
2. Implement caching to reduce requests
3. Upgrade to Production access for higher limits:
   - Go to [Unsplash Dashboard](https://unsplash.com/oauth/applications)
   - Apply for Production access
   - Increase limit to 5000/hour

### Attribution Not Showing

**Problem:** Photographer attribution missing

**Debug:**
```javascript
// Check if attribution data exists
console.log('Product Data:', productData.unsplashAttribution);

// Expected structure:
// {
//   photographerName: "John Doe",
//   photographerUrl: "https://unsplash.com/@johndoe",
//   attributionText: "Photo by John Doe on Unsplash"
// }
```

**Solutions:**
1. Verify image was selected from Unsplash (not uploaded)
2. Check that `handleUnsplashSelect` is called correctly
3. Ensure attribution data is stored in product state

### Search Returns No Results

**Problem:** Search doesn't find any images

**Solutions:**
1. Try broader search terms
2. Check spelling of keywords
3. Use popular categories instead
4. Try different orientation filters
5. Browse curated photos instead of searching

---

## Advanced Usage

### Custom Image Browser

Create a custom implementation:

```javascript
import { searchPhotos, trackPhotoDownload } from './services/unsplashService';

const CustomImageBrowser = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const { data } = await searchPhotos('nature', {
      per_page: 20,
      orientation: 'landscape'
    });

    setPhotos(data.results);
  };

  const handleSelectImage = async (photo) => {
    // Track download (required!)
    await trackPhotoDownload(photo.links.download_location);

    // Use the image
    console.log('Selected:', photo.urls.regular);
  };

  return (
    <div>
      {photos.map(photo => (
        <img
          key={photo.id}
          src={photo.urls.small}
          alt={photo.alt_description}
          onClick={() => handleSelectImage(photo)}
        />
      ))}
    </div>
  );
};
```

### Dynamic Categories

Load categories dynamically:

```javascript
import { getTopics } from './services/unsplashService';

const { data: topics } = await getTopics({ per_page: 50 });

const categories = topics.map(topic => ({
  id: topic.id,
  title: topic.title,
  slug: topic.slug,
  coverPhoto: topic.cover_photo.urls.small
}));
```

### Collection-Based Browsing

Browse specific collections:

```javascript
import { getCollections, getCollectionPhotos } from './services/unsplashService';

// Get featured collections
const { data: collections } = await getCollections({ per_page: 10 });

// Show photos from a collection
const collectionId = collections[0].id;
const { data: photos } = await getCollectionPhotos(collectionId, {
  per_page: 30
});
```

---

## Support Resources

- **Unsplash API Docs:** https://unsplash.com/documentation
- **Unsplash Developers:** https://unsplash.com/developers
- **Unsplash License:** https://unsplash.com/license
- **Unsplash Support:** https://help.unsplash.com/
- **3Commerce Issues:** https://github.com/your-repo/issues

---

## Version History

- **v1.0.0** (2025-01-03) - Initial integration
  - Image browser component
  - Search and filtering
  - Automatic attribution
  - Settings integration

---

## License

This integration is part of the 3Commerce application and uses the Unsplash API under their [API Terms](https://unsplash.com/api-terms).
