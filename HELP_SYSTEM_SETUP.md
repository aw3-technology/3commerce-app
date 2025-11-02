# Help & Getting Started System - Backend Integration

## Overview

The Help & Getting Started system has been successfully connected to the Supabase backend with full FAQ management, help resources, and support ticket functionality.

## Features Implemented

### 1. **Help Service** (`src/services/helpService.js`)

Complete help and support API with the following modules:

#### FAQ Functions:
- `getFaqCategories()` - Get all FAQ categories
- `getFaqItemsByCategory(categoryId)` - Get FAQs for a specific category
- `getAllFaqs()` - Get all FAQs grouped by category
- `searchFaqs(searchTerm)` - Search through FAQ questions and answers
- `incrementFaqViewCount(faqId)` - Track FAQ views
- `markFaqHelpful(faqId, isHelpful)` - Mark FAQ as helpful/not helpful

#### Help Resources Functions:
- `getHelpResources(options)` - Get help resources (videos, tutorials, guides)
- `getHelpResourceById(resourceId)` - Get single help resource
- `incrementResourceViewCount(resourceId)` - Track resource views
- `trackHelpActivity(userId, resourceType, resourceId, action)` - Track user activity
- `getUserHelpActivity(userId, options)` - Get user's help activity history

#### Support Ticket Functions:
- `createSupportTicket(ticketData)` - Create new support ticket
- `getUserSupportTickets(userId, options)` - Get user's tickets
- `getSupportTicketById(ticketId)` - Get ticket with replies
- `replyToSupportTicket(ticketId, userId, message)` - Reply to ticket
- `updateSupportTicketStatus(ticketId, status)` - Update ticket status
- `subscribeToTicketUpdates(ticketId, callback)` - Real-time ticket updates
- `unsubscribeFromTicketUpdates(subscription)` - Unsubscribe from updates

### 2. **Help Sidebar Component** (`src/components/Sidebar/Help/index.js`)

Fully integrated with backend:

- ✅ Loads help resources from database
- ✅ Displays unread message count
- ✅ Tracks resource views
- ✅ Shows "New" badge for recent resources
- ✅ Loading and empty states
- ✅ Quick links to important features

### 3. **FAQ Component** (`src/screens/UpgradeToPro/Faq/index.js`)

Fully integrated with backend:

- ✅ Loads FAQs from database
- ✅ Categorized FAQ display
- ✅ Track FAQ views
- ✅ Mark FAQs as helpful/not helpful
- ✅ Dynamic category filtering
- ✅ Loading and error states

## Database Schema

Six new tables have been created for the help system:

### 1. `faq_categories` Table

Stores FAQ categories like "Get started", "Billing", etc.

```sql
CREATE TABLE faq_categories (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 2. `faq_items` Table

Stores individual FAQ questions and answers.

```sql
CREATE TABLE faq_items (
    id UUID PRIMARY KEY,
    category_id UUID REFERENCES faq_categories(id),
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 3. `help_resources` Table

Stores tutorials, videos, guides, and articles.

```sql
CREATE TABLE help_resources (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(100), -- video, article, tutorial, guide
    image_url TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(50),
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 4. `support_tickets` Table

Stores user support tickets.

```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID REFERENCES auth.users(id),
    resolution TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 5. `support_ticket_replies` Table

Stores replies to support tickets.

```sql
CREATE TABLE support_ticket_replies (
    id UUID PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id),
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_staff_reply BOOLEAN DEFAULT FALSE,
    attachments JSONB,
    created_at TIMESTAMP
);
```

### 6. `user_help_activity` Table

Tracks user interactions with help resources.

```sql
CREATE TABLE user_help_activity (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    resource_type VARCHAR(50),
    resource_id UUID,
    action VARCHAR(50),
    created_at TIMESTAMP
);
```

## Setup Instructions

### 1. Create Database Tables

Run the SQL schema in Supabase SQL Editor:

```bash
# Run this file in your Supabase SQL Editor
database-schema-help.sql
```

This will create:
- All 6 help system tables
- Indexes for performance
- Row Level Security (RLS) policies
- Sample FAQ data
- Sample help resources

### 2. Configure RLS Policies

The schema automatically sets up RLS policies:

**FAQs & Resources:**
- Public read access for active items
- Admin-only write access (configure separately)

**Support Tickets:**
- Users can only view their own tickets
- Users can create and update their own tickets
- Users can reply to their own tickets

**User Activity:**
- Users can only view and create their own activity

### 3. Verify Installation

Check that tables are created:

```sql
-- List all help system tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%faq%' OR table_name LIKE '%help%' OR table_name LIKE '%support%';
```

## How It Works

### Loading FAQs

```javascript
import { getAllFaqs } from '../../services/helpService';

// Get all FAQs grouped by category
const { data: faqs, error } = await getAllFaqs();

// Structure:
// [
//   {
//     title: "Get started",
//     description: "Basic information...",
//     items: [
//       { id, title, content, viewCount, helpfulCount, notHelpfulCount }
//     ]
//   }
// ]
```

### Loading Help Resources

```javascript
import { getHelpResources } from '../../services/helpService';

// Get featured resources
const { data: resources } = await getHelpResources({
  featured: true,
  limit: 5
});

// Get resources by category
const { data: tutorials } = await getHelpResources({
  category: 'tutorial'
});
```

### Creating Support Tickets

```javascript
import { createSupportTicket } from '../../services/helpService';
import { getCurrentUser } from '../../services/authService';

const { data: user } = await getCurrentUser();

const { data: ticket, error } = await createSupportTicket({
  user_id: user.id,
  subject: 'Cannot upload product images',
  description: 'When I try to upload images, I get an error...',
  category: 'technical',
  priority: 'normal'
});
```

### Real-time Ticket Updates

```javascript
import { subscribeToTicketUpdates, unsubscribeFromTicketUpdates } from '../../services/helpService';

// Subscribe to ticket updates
const subscription = subscribeToTicketUpdates(ticketId, (payload) => {
  if (payload.eventType === 'INSERT') {
    console.log('New reply received:', payload.new);
    // Update UI with new reply
  }
});

// Cleanup
return () => {
  unsubscribeFromTicketUpdates(subscription);
};
```

### Tracking User Activity

```javascript
import { trackHelpActivity } from '../../services/helpService';

// Track when user views a tutorial
await trackHelpActivity(
  userId,
  'help_resource',
  resourceId,
  'viewed'
);

// Track when user completes a tutorial
await trackHelpActivity(
  userId,
  'help_resource',
  resourceId,
  'completed'
);

// Track FAQ feedback
await trackHelpActivity(
  userId,
  'faq',
  faqId,
  'helpful'
);
```

## Admin Features (Future Enhancement)

To enable admin management of help content, you can create admin pages:

### Managing FAQs

```javascript
// Admin function to create FAQ
import { supabase } from '../config/supabaseClient';

const createFaq = async (categoryId, question, answer) => {
  const { data, error } = await supabase
    .from('faq_items')
    .insert([{
      category_id: categoryId,
      question: question,
      answer: answer,
      is_active: true
    }])
    .select()
    .single();

  return { data, error };
};
```

### Managing Help Resources

```javascript
// Admin function to create help resource
const createHelpResource = async (resourceData) => {
  const { data, error } = await supabase
    .from('help_resources')
    .insert([{
      title: resourceData.title,
      description: resourceData.description,
      category: resourceData.category,
      image_url: resourceData.image_url,
      video_url: resourceData.video_url,
      is_new: true,
      is_featured: resourceData.featured || false
    }])
    .select()
    .single();

  return { data, error };
};
```

## Sample Data

The schema includes sample data:

### FAQ Categories:
1. Get started
2. Login & access
3. Billing & payments
4. My benefits
5. Account settings

### Sample FAQs:
- How to upgrade to Pro account?
- I forgot my password
- What payment methods do you accept?
- And more...

### Sample Help Resources:
1. Exclusive downloads (tutorial)
2. Behind the scenes (video)
3. Use guidelines (guide)
4. Life & work update (article)
5. Promote your product (tutorial)

## Testing

### 1. Test FAQ Loading

1. Navigate to `/upgrade-to-pro` page
2. Scroll to FAQ section
3. Verify FAQs are loaded from database
4. Click between categories
5. Check browser console for any errors

### 2. Test Help Sidebar

1. Click "Help & getting started" in sidebar
2. Verify help resources load
3. Verify unread message count shows (if you have messages)
4. Click on a resource to view
5. Verify view count increments in database

### 3. Test Support Tickets

```javascript
// Test creating a ticket
import { createSupportTicket } from './services/helpService';
import { getCurrentUser } from './services/authService';

const testCreateTicket = async () => {
  const { data: user } = await getCurrentUser();

  const { data, error } = await createSupportTicket({
    user_id: user.id,
    subject: 'Test ticket',
    description: 'This is a test support ticket',
    category: 'technical',
    priority: 'normal'
  });

  console.log('Ticket created:', data);
};
```

### 4. Verify Database

```sql
-- Check FAQs
SELECT c.title as category, COUNT(i.*) as faq_count
FROM faq_categories c
LEFT JOIN faq_items i ON c.id = i.category_id
GROUP BY c.title;

-- Check help resources
SELECT category, COUNT(*)
FROM help_resources
GROUP BY category;

-- Check support tickets
SELECT status, COUNT(*)
FROM support_tickets
GROUP BY status;
```

## Troubleshooting

### FAQs not loading?

1. Check database tables exist: `SELECT * FROM faq_categories LIMIT 1;`
2. Verify RLS policies allow read access
3. Check browser console for errors
4. Verify sample data was inserted

### Help resources empty?

1. Check if resources exist: `SELECT COUNT(*) FROM help_resources;`
2. Verify RLS policies
3. Check `is_active` field is true or null
4. Insert sample data manually if needed

### Support tickets not working?

1. Verify user is authenticated
2. Check RLS policies for support_tickets table
3. Verify foreign key relationships
4. Check user_id matches current user

### View counts not incrementing?

1. Check if updates are allowed by RLS
2. Verify the increment functions are working
3. Check browser console for errors
4. Try direct SQL update to test

## Future Enhancements

Possible improvements:

- [ ] Admin dashboard for managing FAQs
- [ ] Admin interface for help resources
- [ ] Support ticket assignment system
- [ ] Email notifications for ticket updates
- [ ] Live chat integration
- [ ] FAQ voting and rating system
- [ ] Help resource recommendations
- [ ] Search across all help content
- [ ] Video tutorials with timestamps
- [ ] Interactive product tours
- [ ] Community forum integration
- [ ] AI-powered help suggestions

## API Reference

See `src/services/helpService.js` for complete API documentation with JSDoc comments.

## Related Files

- `src/services/helpService.js` - Help service
- `src/components/Sidebar/Help/index.js` - Help sidebar
- `src/screens/UpgradeToPro/Faq/index.js` - FAQ section
- `database-schema-help.sql` - Database schema
- `src/mocks/faq.js` - Original mock data (for reference)

## Integration with Other Systems

### With Message Center:
The Help sidebar shows unread message count from the message system.

### With Notifications:
Support ticket updates can trigger notifications (to be implemented).

### With Analytics:
Track which help resources are most viewed and helpful.

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **User Data**: Users can only access their own tickets and activity
3. **Public Content**: FAQs and resources are public but read-only
4. **Input Validation**: Sanitize all user inputs for support tickets
5. **Rate Limiting**: Consider implementing rate limits on ticket creation

## Performance Tips

1. **Indexes**: Already created on frequently queried columns
2. **Caching**: Consider caching FAQ data on the client
3. **Pagination**: Implement pagination for large result sets
4. **Lazy Loading**: Load help resources only when sidebar is opened
5. **Debouncing**: Debounce view count increments
