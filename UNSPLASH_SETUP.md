# Unsplash Integration - Quick Setup Guide

## Overview

The Unsplash integration provides access to millions of high-quality, free stock images for your 3Commerce store products.

## Setup Steps

### 1. Verify Environment Variables

Your Unsplash API credentials have been added to `.env`:

```env
REACT_APP_UNSPLASH_ACCESS_KEY=KrY-tw64HNRZrSMkRdf-6HqCR_xyVCkH1tbvfZ4faPc
REACT_APP_UNSPLASH_SECRET_KEY=OMaySvNUoTBOAYsEHRupI74nczUCIcCXHdD9RBv_O3s
REACT_APP_UNSPLASH_APPLICATION_ID=825626
```

### 2. Restart Development Server

After the .env changes, restart your server:

```bash
# Stop the current server (Ctrl+C)
npm start
```

### 3. Test the Connection

1. Navigate to **Settings → Integrations** in your app
2. Scroll to **Unsplash Integration** section
3. Click the "Test Connection" button
4. Verify you see "Connected" status

### 4. Use Unsplash Images in Products

1. Go to **New Product**
2. Scroll to **Images & CTA** section
3. Click "Browse Unsplash Images"
4. Search or browse for images
5. Click an image to select it
6. The image and attribution are automatically added

---

## What Was Integrated

### ✅ Features Implemented

1. **Unsplash Service Layer**
   - API client with authentication
   - Search and browse functionality
   - Automatic download tracking
   - Attribution helpers

2. **UI Components**
   - Image browser modal with search
   - Category filtering
   - Orientation filters
   - Infinite scroll
   - Settings integration page

3. **Product Integration**
   - Unsplash browser in New Product workflow
   - Image preview with attribution
   - Automatic photographer credit

4. **Features**
   - Search by keywords
   - Browse popular categories
   - Filter by orientation (landscape, portrait, square)
   - Load more with pagination
   - Automatic attribution tracking

### 📁 Files Created

```
src/
├── services/
│   ├── unsplashClient.js           # API client
│   └── unsplashService.js          # Image operations & helpers
│
├── components/
│   └── UnsplashBrowser/            # Image browser modal
│       ├── index.js
│       └── UnsplashBrowser.module.sass
│
└── screens/
    └── Settings/Unsplash/          # Integration settings
        ├── index.js
        └── Unsplash.module.sass

Documentation:
├── UNSPLASH_INTEGRATION.md         # Full documentation
└── UNSPLASH_SETUP.md              # This file
```

### 🔄 Files Modified

```
src/screens/NewProduct/ImagesAndCTA/
├── index.js                        # Added Unsplash browser button
└── ImagesAndCTA.module.sass       # Added preview & attribution styles

src/screens/NewProduct/index.js     # Added unsplashAttribution to state

src/screens/Settings/index.js       # Added Unsplash section

src/services/index.js               # Export Unsplash services

.env                                # Added API credentials
```

---

## Usage Flow

### Using Unsplash Images

```
New Product Page
    ↓
Images & CTA Section
    ↓
Click "Browse Unsplash Images"
    ↓
Search or Browse Photos
    ↓
Select Image (auto-attribution)
    ↓
Preview with Photographer Credit
    ↓
Publish Product
```

### Image Selection Options

You can use images from two sources:

1. **Upload Your Own**
   - Click "Click or drop image"
   - Upload from computer
   - No attribution shown

2. **Browse Unsplash**
   - Click "Browse Unsplash Images"
   - Search millions of free images
   - Automatic attribution included

---

## Verification Checklist

- [ ] API credentials added to `.env`
- [ ] Server restarted successfully
- [ ] Settings page shows "Connected" status
- [ ] Can open Unsplash browser modal
- [ ] Can search for images
- [ ] Can browse popular categories
- [ ] Can select and preview images
- [ ] Attribution displays correctly

---

## Features Walkthrough

### 1. Search Images

- Use search bar for specific queries
- Try keywords like "business", "nature", "technology"
- Results update in real-time

### 2. Browse Categories

- Click popular categories for quick browsing
- Categories include: business, technology, food, nature, fashion, travel, and more

### 3. Filter by Orientation

- **All**: Show all images
- **Landscape**: Horizontal images (good for headers)
- **Portrait**: Vertical images (good for cards)
- **Square**: Square images (good for thumbnails)

### 4. Load More Images

- Scroll to bottom of results
- Click "Load More" button
- Loads 30 more images per click

### 5. Select Image

- Click any image to select it
- Image automatically added to product
- Attribution shows below image
- Links to photographer's Unsplash profile

---

## API Rate Limits

### Current Limits

- **50 requests/hour** (Development/Demo)
- Resets every hour
- Tracked per application

### If You Hit the Limit

1. **Wait**: Limit resets hourly
2. **Cache**: Store search results locally
3. **Upgrade**: Apply for Production access
   - Go to [Unsplash Dashboard](https://unsplash.com/oauth/applications)
   - Request Production access
   - Get 5000 requests/hour

---

## Troubleshooting

### Connection Test Fails

**Solutions:**
1. Check `.env` file has correct credentials
2. Restart development server
3. Check Unsplash API status: https://status.unsplash.com/

### Images Don't Load

**Solutions:**
1. Open browser console for errors
2. Check network tab in DevTools
3. Verify API key is valid in Unsplash dashboard
4. Try different search terms

### Attribution Missing

**Checks:**
1. Verify image was selected from Unsplash (not uploaded)
2. Check product state includes `unsplashAttribution`
3. View attribution data in browser console

### Search Returns No Results

**Solutions:**
1. Try broader search terms
2. Check spelling
3. Use popular categories instead
4. Browse curated photos

---

## Best Practices

### 1. Search Tips

- Use specific, descriptive keywords
- Try multiple search variations
- Use category filters
- Filter by orientation for better results

### 2. Image Selection

- Choose images that match your product
- Consider orientation for your layout
- Check image quality in preview
- Verify attribution displays correctly

### 3. Attribution

- Always keep attribution intact
- Don't remove photographer credit
- Link to Unsplash is automatic
- This is handled by the integration

### 4. License Compliance

Unsplash images are:
- ✅ Free for commercial use
- ✅ No permission needed
- ✅ Attribution appreciated (but not required)
- ❌ Can't be sold unmodified
- ❌ Can't be compiled into competing service

---

## Next Steps

1. **Test the Integration**
   - Create a test product with Unsplash image
   - Verify attribution displays
   - Check image quality

2. **Read Full Documentation**
   - See `UNSPLASH_INTEGRATION.md` for API reference
   - Learn advanced features
   - Review best practices

3. **Monitor Usage**
   - Check API usage in Unsplash dashboard
   - Watch for rate limit warnings
   - Consider upgrading to Production if needed

4. **Explore Features**
   - Try different search terms
   - Browse collections
   - Test orientation filters
   - Use popular categories

---

## Support

For detailed information, see:
- **Full Documentation:** `UNSPLASH_INTEGRATION.md`
- **Unsplash API Docs:** https://unsplash.com/documentation
- **Unsplash Developers:** https://unsplash.com/developers
- **Unsplash Support:** https://help.unsplash.com/

---

**Integration completed successfully!** 🎉

Your 3Commerce app now has access to millions of beautiful, free images from Unsplash.
