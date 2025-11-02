# Notifications Backend Integration

The notifications section has been successfully connected to the Supabase backend!

## What's Been Implemented

### 1. Notification Service (`src/services/notificationService.js`)

A complete service with the following functions:

#### Core Functions
- `getAllNotifications(options)` - Fetch notifications with filtering, pagination, and sorting
- `getNotificationById(id)` - Get a single notification
- `createNotification(data)` - Create a new notification
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead()` - Mark all user notifications as read
- `deleteNotification(id)` - Delete a single notification
- `deleteAllNotifications()` - Delete all user notifications
- `getNotificationCount(options)` - Get count of notifications (optionally unread only)

#### Real-time Updates
- `subscribeToNotifications(callback)` - Subscribe to real-time notification updates
- `unsubscribeFromNotifications(subscription)` - Unsubscribe from updates

### 2. Updated Components

#### Notification List Page (`src/screens/Notification/List/index.js`)
- Fetches notifications from backend
- Real-time updates via Supabase subscriptions
- Filter by type (Comments, Likes, Review, Mentions, Purchases, Message)
- Sort by Recent, New (unread only), This year
- Pagination with "Load more" button
- Mark all as read functionality
- Shows unread count in title

#### Notification List Item (`src/screens/Notification/List/Item/index.js`)
- Automatically marks notification as read when clicked
- Delete individual notifications
- Navigate to linked resources
- Time formatting (e.g., "2h", "3d")
- Color-coded by notification type

#### Header Notification Dropdown (`src/components/Header/Notification/index.js`)
- Shows latest 5 notifications
- Real-time badge with unread count
- Mark all as read
- Delete all notifications
- Auto-refresh on updates

#### Header Notification Item (`src/components/Header/Notification/Item/index.js`)
- Click to mark as read and navigate
- Time formatting
- Type-based styling

## Database Schema

The notifications table structure:

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50), -- order, product, customer, system
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Notification Types

The system supports 4 notification types, each with unique styling:

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `order` | Green (#83BF6E) | Shopping bag | Purchase notifications |
| `product` | Purple (#8E59FF) | Star | Product reviews, likes |
| `customer` | Blue (#2A85FF) | Message | Comments, mentions |
| `system` | Red (#FF6A55) | Notification | System messages |

## Usage Examples

### Creating a Notification

```javascript
import { createNotification } from '../services/notificationService';

// When a customer makes a purchase
await createNotification({
  title: 'New Purchase',
  message: 'Customer John Doe purchased Product XYZ',
  type: 'order',
  link: '/order/123'
});
```

### Fetching Notifications

```javascript
import { getAllNotifications } from '../services/notificationService';

// Get unread notifications only
const { data } = await getAllNotifications({
  unreadOnly: true,
  limit: 10
});

// Get notifications of specific type
const { data } = await getAllNotifications({
  type: 'order',
  limit: 20
});
```

### Real-time Subscriptions

```javascript
import { subscribeToNotifications, unsubscribeFromNotifications } from '../services/notificationService';

// In a React component
useEffect(() => {
  const subscription = subscribeToNotifications((payload) => {
    console.log('New notification:', payload);
    // Refresh your notifications list
  });

  return () => {
    unsubscribeFromNotifications(subscription);
  };
}, []);
```

## Features Implemented

✅ Fetch notifications from database
✅ Real-time updates with Supabase subscriptions
✅ Mark notifications as read (single and bulk)
✅ Delete notifications (single and bulk)
✅ Filter by notification type
✅ Sort by time and read status
✅ Pagination with load more
✅ Unread count badge in header
✅ Auto-mark as read when clicked
✅ Navigate to linked resources
✅ Time formatting (relative time)
✅ Type-based color coding
✅ Loading states
✅ Empty states
✅ Error handling

## Testing

To test the notification system:

1. **Create test notifications** via Supabase SQL editor:

```sql
INSERT INTO notifications (user_id, title, message, type, read, link)
VALUES
  (auth.uid(), 'New Order', 'You have a new order from John Doe', 'order', false, '/orders/1'),
  (auth.uid(), 'Product Review', 'Someone left a 5-star review', 'product', false, '/products/1'),
  (auth.uid(), 'New Comment', 'Customer commented on your product', 'customer', false, '/comments/1'),
  (auth.uid(), 'System Update', 'Your account has been updated', 'system', true, '/settings');
```

2. **Check the header** - You should see an unread count badge
3. **Click the notification icon** - Dropdown shows recent notifications
4. **Visit /notification** - Full notification list with filters
5. **Click a notification** - Should mark as read and navigate
6. **Test "Mark all as read"** - Should clear unread badge
7. **Test "Load more"** - Should fetch additional notifications
8. **Test filters** - Filter by notification type

## Integration with Other Features

You can trigger notifications from other parts of the app:

### On New Order
```javascript
// In orderService.js after creating an order
await createNotification({
  title: 'New Order',
  message: `Order #${orderId} received`,
  type: 'order',
  link: `/orders/${orderId}`
});
```

### On Product Review
```javascript
// In commentService.js after creating a comment
await createNotification({
  title: 'New Review',
  message: `${customerName} left a ${rating}-star review`,
  type: 'product',
  link: `/products/${productId}`
});
```

### On Refund Request
```javascript
// In orderService.js when refund requested
await createNotification({
  title: 'Refund Request',
  message: `Refund requested for order #${orderId}`,
  type: 'order',
  link: `/refunds/${refundId}`
});
```

## Next Steps

Consider adding these enhancements:

1. **Push notifications** - Integrate browser push notifications
2. **Email notifications** - Send email for important notifications
3. **Notification preferences** - Let users configure notification types
4. **Bulk actions** - Select multiple notifications for batch operations
5. **Search** - Search through notification history
6. **Archive** - Archive old notifications instead of deleting
7. **Categories** - More granular notification categories
8. **Priority levels** - Mark notifications as urgent/normal/low

## Troubleshooting

### Notifications not appearing
- Check that you're logged in (notifications are user-specific)
- Verify the notifications table exists in Supabase
- Check browser console for errors

### Real-time updates not working
- Ensure Supabase realtime is enabled for the notifications table
- Check that the subscription is properly set up
- Verify websocket connection in network tab

### Badge count not updating
- Check that `getNotificationCount` is being called
- Verify that notifications have correct `user_id`
- Check that `read` field is properly updated
