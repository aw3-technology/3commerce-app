# Device Analytics Integration - Complete

## Overview

The Top Device section on the Customers Overview page (`/customers/overview`) is now fully connected to your Supabase backend. It displays real-time device analytics based on session data from the `sessions` table.

## What Was Implemented

### 1. Analytics Service Function (`src/services/analyticsService.js`)

Added `getDeviceAnalytics()` function that:
- Fetches all sessions from the database
- Analyzes user agent strings to determine device type
- Calculates device distribution (Mobile, Tablet, Desktop)
- Returns data formatted for the pie chart and legend

**Helper Function:**
- `detectDeviceType(userAgent)` - Intelligently parses user agent strings to identify:
  - **Mobile**: iPhone, Android phones, Windows Phone, BlackBerry
  - **Tablet**: iPad, Android tablets
  - **Desktop**: All other devices (Windows, Mac, Linux)

### 2. Updated TopDevice Component (`src/screens/Customers/TopDevice/index.js`)

**Features:**
- Fetches real device analytics data on component mount
- Displays loading state while fetching data
- Shows actual device percentages from database
- Graceful error handling with fallback to empty state
- Helpful message when no session data exists
- Pie chart visualization with color-coded device types:
  - Mobile: Purple (#8E59FF)
  - Tablet: Green (#83BF6E)
  - Desktop: Blue (#2A85FF)

### 3. Sample Data Script (`scripts/add-sample-sessions.js`)

Created a utility script to populate the database with realistic session data:
- 1,700 sample sessions inserted
- Device distribution matching original design:
  - Mobile: 20% (~340 sessions)
  - Tablet: 5% (~85 sessions)
  - Desktop: 75% (~1275 sessions)
- Realistic user agent strings for each device type
- Random timestamps over last 30 days
- IP addresses, referrers, and session metadata

## Database Schema

The integration uses the `sessions` table with these key fields:

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255),
    user_agent TEXT,          -- Used for device detection
    ip_address VARCHAR(50),
    referrer TEXT,
    pages_viewed INTEGER,
    duration INTEGER,
    created_at TIMESTAMP
);
```

## How It Works

### 1. User Agent Detection

The system analyzes browser user agent strings to categorize devices:

```javascript
// Example user agents:
Mobile:  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)..."
Tablet:  "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)..."
Desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
```

### 2. Data Flow

```
Sessions Table (Supabase)
    ↓
getDeviceAnalytics() (Analytics Service)
    ↓ Parse user agents
    ↓ Calculate percentages
    ↓ Format for display
TopDevice Component
    ↓
Render Pie Chart + Legend
```

### 3. Real-time Updates

The component fetches fresh data every time the page loads. To enable real-time updates, you can:
- Add a refresh interval
- Use Supabase real-time subscriptions
- Trigger refresh on user action

## Usage

### View Device Analytics

1. Navigate to `/customers/overview` in your app
2. The "Top Device" card will display current device distribution
3. Data updates automatically on page refresh

### Add More Session Data

Run the sample data script again to add more sessions:

```bash
node scripts/add-sample-sessions.js
```

Or insert sessions via your own analytics tracking when users visit your site.

### Track Real User Sessions

To track actual user sessions, add this to your app:

```javascript
// Example: Track session when user visits
import { createClient } from '@supabase/supabase-js';

const trackSession = async () => {
  const supabase = createClient(url, key);

  await supabase.from('sessions').insert({
    session_id: generateSessionId(),
    user_agent: navigator.userAgent,
    ip_address: await fetchUserIP(),
    referrer: document.referrer,
    pages_viewed: 1,
    created_at: new Date().toISOString()
  });
};
```

## API Reference

### getDeviceAnalytics()

Fetches and analyzes device distribution from sessions.

**Returns:**
```javascript
{
  data: {
    chartData: [
      { name: 'Mobile', value: 340 },
      { name: 'Tablet', value: 85 },
      { name: 'Desktop', value: 1275 }
    ],
    legend: [
      {
        title: 'Mobile',
        percent: 20,
        count: 340,
        icon: 'mobile',
        fill: '#8E59FF'
      },
      // ... tablet and desktop
    ],
    totalSessions: 1700
  },
  error: null
}
```

**Error Handling:**
- Returns empty data with 0 counts if database error
- Component displays helpful message when no data exists
- Logs errors to console for debugging

## Testing

### Test the Integration

1. **View the Component:**
   - Navigate to http://localhost:3000/customers/overview
   - Scroll to "Top Device" card
   - Verify pie chart displays with correct percentages

2. **Check Data:**
   ```javascript
   // In browser console
   import { getDeviceAnalytics } from './services/analyticsService';
   const result = await getDeviceAnalytics();
   console.log(result);
   ```

3. **Verify in Supabase:**
   - Open Supabase dashboard
   - Go to Table Editor → sessions
   - Verify 1,700 rows exist
   - Check user_agent values

### Expected Output

With the sample data, you should see:
- **Mobile**: 20% (purple slice)
- **Tablet**: 5% (green slice)
- **Desktop**: 75% (blue slice)

## Customization

### Change Device Colors

Edit `src/screens/Customers/TopDevice/index.js`:

```javascript
const COLORS = ["#8E59FF", "#83BF6E", "#2A85FF"];
// Change to your preferred colors
```

### Adjust Distribution Logic

Modify `detectDeviceType()` in `src/services/analyticsService.js` to change how devices are categorized.

### Add More Device Types

1. Add new device type to detection logic
2. Add corresponding color to COLORS array
3. Update legend formatting

## Performance Notes

- Fetches all sessions on component mount
- For large datasets (10,000+ sessions), consider:
  - Adding pagination
  - Caching results
  - Using database aggregation
  - Implementing date filters

### Optimization Example

```javascript
// Add date filter for last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const { data, error } = await supabase
  .from('sessions')
  .select('user_agent')
  .gte('created_at', thirtyDaysAgo.toISOString());
```

## Troubleshooting

### "No session data available" message

**Cause:** Sessions table is empty

**Solution:** Run the sample data script:
```bash
node scripts/add-sample-sessions.js
```

### Pie chart not displaying

**Cause:** Data format mismatch or loading error

**Solution:**
1. Check browser console for errors
2. Verify Supabase connection in `.env`
3. Check sessions table has data

### Wrong percentages

**Cause:** User agent detection logic

**Solution:**
1. Check user_agent values in database
2. Verify `detectDeviceType()` logic
3. Update detection patterns if needed

### Loading forever

**Cause:** Database connection issue

**Solution:**
1. Verify Supabase credentials
2. Check network tab in browser DevTools
3. Ensure Row Level Security policies allow reads

## Next Steps

1. **Add Real Session Tracking**
   - Implement analytics tracking on page views
   - Capture real user agent strings
   - Store session data on site visits

2. **Add Time Filters**
   - Add dropdown to filter by date range
   - Show device trends over time
   - Compare week-over-week changes

3. **Enhanced Analytics**
   - Track device conversion rates
   - Add browser breakdown
   - Show OS distribution

4. **Real-time Updates**
   - Add Supabase real-time subscriptions
   - Auto-refresh data periodically
   - Show live visitor count

## Files Modified

### Created:
- `scripts/add-sample-sessions.js` - Sample data insertion script
- `DEVICE_ANALYTICS_INTEGRATION.md` - This documentation

### Modified:
- `src/services/analyticsService.js` - Added `getDeviceAnalytics()` function
- `src/screens/Customers/TopDevice/index.js` - Connected to backend

### Database:
- `sessions` table - Populated with 1,700 sample records

## Support

For analytics service documentation:
- See `src/services/analyticsService.js` for all available functions
- Check `BACKEND_INTEGRATION_GUIDE.md` for general backend usage

For Supabase queries:
- https://supabase.com/docs/reference/javascript/select
- https://supabase.com/docs/guides/database/tables
