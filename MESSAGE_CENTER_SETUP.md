# Message Center - Backend Integration

## Overview

The Message Center has been successfully connected to the Supabase backend with full real-time messaging capabilities.

## Features Implemented

### 1. **Message Service** (`src/services/messageService.js`)

Complete messaging API with the following functions:

- `getConversations(userId)` - Fetch all conversations for a user
- `getConversationMessages(userId, partnerId)` - Get messages in a specific conversation
- `sendMessage(messageData)` - Send a new message
- `markAsRead(messageId)` - Mark a single message as read
- `markConversationAsRead(userId, partnerId)` - Mark all messages in a conversation as read
- `deleteMessage(messageId)` - Delete a message
- `searchMessages(userId, searchTerm)` - Search through messages
- `getUnreadCount(userId)` - Get count of unread messages
- `subscribeToMessages(userId, callback)` - Real-time message subscription
- `unsubscribeFromMessages(subscription)` - Unsubscribe from real-time updates

### 2. **Message Center Screen** (`src/screens/MessageCenter/index.js`)

Fully integrated with backend:

- ✅ Loads conversations from database
- ✅ Displays messages in real-time
- ✅ Sends messages to database
- ✅ Marks messages as read
- ✅ Deletes messages
- ✅ Search functionality
- ✅ Real-time updates via Supabase subscriptions
- ✅ Loading and error states

### 3. **Header Messages Component** (`src/components/Header/Messages/index.js`)

Shows recent messages with:

- ✅ Unread message count badge
- ✅ Last 5 conversations
- ✅ Real-time updates
- ✅ Mark all as read functionality
- ✅ Link to full message center

## Database Schema

The `messages` table structure (already created):

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id),
    recipient_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES customers(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security Policies:

- Users can only view messages they sent or received
- Users can only send messages as themselves

## How It Works

### Sending a Message

```javascript
import { sendMessage } from '../../services/messageService';
import { getCurrentUser } from '../../services/authService';

// Get current user
const { data: user } = await getCurrentUser();

// Send a message
const { data, error } = await sendMessage({
  sender_id: user.id,
  recipient_id: 'recipient-uuid',
  content: 'Hello! This is my message.',
  subject: 'Optional subject',
  customer_id: 'optional-customer-uuid'
});
```

### Loading Conversations

```javascript
import { getConversations } from '../../services/messageService';

// Get all conversations
const { data: conversations, error } = await getConversations(userId);

// Each conversation includes:
// - Latest message
// - Partner user info
// - Unread status
// - Timestamp
```

### Real-time Updates

```javascript
import { subscribeToMessages, unsubscribeFromMessages } from '../../services/messageService';

// Subscribe to new messages
const subscription = subscribeToMessages(userId, (newMessage) => {
  console.log('New message received:', newMessage);
  // Update UI
});

// Cleanup on unmount
return () => {
  unsubscribeFromMessages(subscription);
};
```

## Component Integration

### MessageCenter Component Flow:

1. **Mount**: Fetches current user
2. **Load Data**: Gets conversations and subscribes to real-time updates
3. **User Interaction**:
   - Click conversation → Load messages
   - Type message → Send to backend
   - Mark as read → Update database
   - Search → Query database
4. **Unmount**: Unsubscribe from real-time updates

### Key Props:

**Users Component:**
- `items` - Array of conversations
- `onConversationSelect` - Callback when conversation is selected
- `loading` - Loading state
- `search` / `setSearch` - Search state
- `onSubmit` - Search handler

**Messages Component:**
- `messages` - Array of messages in conversation
- `onSendMessage` - Callback to send message
- `selectedConversation` - Current conversation
- `actions` - Actions menu (mark read, delete)
- `parameters` - Customer info (if available)

**Send Component:**
- `onSendMessage` - Callback to send message
- Handles Enter key to send
- Clears input after sending

## Testing

### 1. Prerequisites

Make sure you have:
- ✅ Supabase project configured
- ✅ `.env` file with correct credentials
- ✅ Database tables created (run `database-schema.sql`)
- ✅ At least 2 user accounts for testing

### 2. Test Flow

1. **Sign in** as User A
2. **Navigate** to Message Center (`/message-center`)
3. **Create a test message** in the database (or via another user)
4. **Verify** messages load correctly
5. **Send a message** using the UI
6. **Check database** to confirm message was saved
7. **Sign in as User B** in another browser/tab
8. **Verify** real-time message appears
9. **Test search** functionality
10. **Test mark as read**
11. **Test delete message**

### 3. Manual Database Testing

You can insert test messages directly in Supabase SQL Editor:

```sql
-- Insert a test message
INSERT INTO messages (sender_id, recipient_id, content)
VALUES (
  'sender-user-id',
  'recipient-user-id',
  'This is a test message!'
);

-- View all messages
SELECT * FROM messages ORDER BY created_at DESC;

-- Check unread count
SELECT COUNT(*) FROM messages
WHERE recipient_id = 'your-user-id' AND read = false;
```

## Troubleshooting

### Messages not loading?

1. Check browser console for errors
2. Verify user is authenticated (`getCurrentUser()` returns data)
3. Check Supabase RLS policies are enabled
4. Verify database connection in `.env`

### Real-time not working?

1. Check if real-time is enabled in Supabase project settings
2. Verify subscription code is running
3. Check browser console for subscription errors
4. Ensure proper cleanup on unmount

### "Failed to authenticate user" error?

1. User must be logged in
2. Check authService is working
3. Verify session exists in Supabase

### Messages showing as undefined?

1. Check data transformation in components
2. Verify database query is selecting correct fields
3. Check for null/undefined values in user metadata

## Future Enhancements

Possible improvements:

- [ ] File attachments
- [ ] Message reactions/emojis
- [ ] Typing indicators
- [ ] Online/offline status (currently hardcoded)
- [ ] Message threads/replies
- [ ] Message notifications
- [ ] Bulk actions (delete multiple, archive)
- [ ] Message filtering by date/user
- [ ] Export conversation history
- [ ] Block/mute users

## API Reference

See `src/services/messageService.js` for complete API documentation with JSDoc comments.

## Related Files

- `src/services/messageService.js` - Message service
- `src/screens/MessageCenter/index.js` - Main message center
- `src/screens/MessageCenter/Users/index.js` - Conversation list
- `src/screens/MessageCenter/Messages/index.js` - Message thread
- `src/screens/MessageCenter/Messages/Send/index.js` - Send message form
- `src/components/Header/Messages/index.js` - Header messages dropdown
- `database-schema.sql` - Database schema (messages table)
