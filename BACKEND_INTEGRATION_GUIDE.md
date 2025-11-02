# 3Commerce Backend Integration Guide

## ✅ Completed Setup

Your 3Commerce app is now connected to Supabase PostgreSQL database!

### Database Tables Created:
- ✅ `products` - Store product information
- ✅ `customers` - Customer/user data
- ✅ `orders` - Order transactions
- ✅ `order_items` - Individual items in orders
- ✅ `transactions` - Payment transactions
- ✅ `refunds` - Refund requests
- ✅ `comments` - Product reviews/comments
- ✅ `product_views` - Analytics for product views
- ✅ `traffic_sources` - Traffic analytics
- ✅ `sessions` - User session tracking
- ✅ `notifications` - User notifications
- ✅ `messages` - Message center

### Services Created:
- ✅ `authService.js` - Authentication (sign up, sign in, password reset)
- ✅ `productService.js` - Product CRUD operations
- ✅ `customerService.js` - Customer management
- ✅ `orderService.js` - Order & transaction management
- ✅ `commentService.js` - Comments & reviews
- ✅ `analyticsService.js` - Dashboard analytics
- ✅ `notificationService.js` - Notification management with real-time updates

## How to Use Services in Your Pages

### Example 1: Products Dashboard Page

```javascript
// In src/screens/ProductsDashboard/index.js
import { useEffect, useState } from 'react';
import { getAllProducts, getProductStats } from '../../services/productService';

function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch products
    const { data: productsData, error: productsError } = await getAllProducts({ limit: 10 });
    if (!productsError) {
      setProducts(productsData || []);
    }

    // Fetch stats
    const { data: statsData, error: statsError } = await getProductStats();
    if (!statsError) {
      setStats(statsData);
    }

    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products Dashboard</h1>
      <div>
        <p>Total Products: {stats?.total}</p>
        <p>Published: {stats?.published}</p>
        <p>Drafts: {stats?.draft}</p>
      </div>

      <div>
        {products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>Status: {product.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsDashboard;
```

### Example 2: Create New Product

```javascript
// In src/screens/NewProduct/index.js
import { useState } from 'react';
import { createProduct } from '../../services/productService';

function NewProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    status: 'draft'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await createProduct(formData);

    if (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } else {
      console.log('Product created:', data);
      alert('Product created successfully!');
      // Reset form or redirect
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
      />
      <button type="submit">Create Product</button>
    </form>
  );
}
```

### Example 3: Customer List

```javascript
// In src/screens/CustomerList/index.js
import { useEffect, useState } from 'react';
import { getAllCustomers, searchCustomers } from '../../services/customerService';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await getAllCustomers({ limit: 50 });
    if (!error) {
      setCustomers(data || []);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const { data, error } = await searchCustomers(term);
      if (!error) {
        setCustomers(data || []);
      }
    } else {
      fetchCustomers();
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.order_count}</td>
              <td>${customer.total_spent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 4: Dashboard Analytics

```javascript
// In src/screens/Home/index.js
import { useEffect, useState } from 'react';
import { getDashboardStats, getSalesData } from '../../services/analyticsService';

function Home() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Get overview stats
    const { data: statsData } = await getDashboardStats();
    setStats(statsData);

    // Get sales data for chart
    const { data: sales } = await getSalesData('month');
    setSalesData(sales || []);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats?.revenue || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats?.orders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats?.products || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{stats?.customers || 0}</p>
        </div>
      </div>
    </div>
  );
}
```

## Page-to-Service Mapping

| Page | Service Functions to Use |
|------|-------------------------|
| **Home** | `getDashboardStats()`, `getSalesData()` |
| **Products Dashboard** | `getAllProducts()`, `getProductStats()` |
| **New Product** | `createProduct()` |
| **Drafts** | `getProductsByStatus('draft')` |
| **Released** | `getProductsByStatus('published')` |
| **Scheduled** | `getProductsByStatus('scheduled')` |
| **Comments** | `getAllComments()`, `moderateComment()` |
| **Customers** | `getAllCustomers()`, `getCustomerStats()` |
| **Customer List** | `getAllCustomers()`, `searchCustomers()` |
| **Earning** | `getEarnings()`, `getOrderStats()` |
| **Refunds** | `getRefunds()`, `processRefund()` |
| **Statements** | `getTransactions()` |
| **Sign In** | `signIn()` |
| **Sign Up** | `signUp()` |
| **Settings** | `updateProfile()`, `updatePassword()` |
| **Notifications** | `getAllNotifications()`, `markAsRead()`, `deleteNotification()` - ✅ IMPLEMENTED |
| **Message Center** | `getConversations()`, `sendMessage()`, `markAsRead()` - ✅ IMPLEMENTED (See MESSAGE_CENTER_SETUP.md) |
| **Help Sidebar** | `getHelpResources()`, `incrementResourceViewCount()`, `getUnreadCount()` - ✅ IMPLEMENTED |
| **FAQ Section** | `getAllFaqs()`, `incrementFaqViewCount()`, `markFaqHelpful()` - ✅ IMPLEMENTED (See HELP_SYSTEM_SETUP.md) |

## Available Service Functions

### Product Service
- `getAllProducts(options)` - Get all products with filters
- `getProductById(id)` - Get single product
- `createProduct(data)` - Create new product
- `updateProduct(id, updates)` - Update product
- `deleteProduct(id)` - Delete product
- `getProductsByStatus(status)` - Filter by status
- `getProductStats()` - Get product statistics
- `searchProducts(term)` - Search products

### Customer Service
- `getAllCustomers(options)` - Get all customers
- `getCustomerById(id)` - Get single customer
- `createCustomer(data)` - Create customer
- `updateCustomer(id, updates)` - Update customer
- `deleteCustomer(id)` - Delete customer
- `getCustomerStats()` - Get customer statistics
- `searchCustomers(term)` - Search customers
- `getCustomerPurchases(customerId)` - Get purchase history

### Order Service
- `getAllOrders(options)` - Get all orders
- `getOrderById(id)` - Get single order
- `createOrder(data)` - Create order
- `updateOrder(id, updates)` - Update order
- `getOrderStats()` - Get order statistics
- `getTransactions(options)` - Get transactions
- `getEarnings(period)` - Get earnings data
- `getRefunds()` - Get refund requests
- `processRefund(id, status)` - Process refund

### Auth Service
- `signUp(email, password, metadata)` - Register user
- `signIn(email, password)` - Login user
- `signOut()` - Logout user
- `getSession()` - Get current session
- `getCurrentUser()` - Get current user
- `updateProfile(updates)` - Update profile
- `resetPassword(email)` - Password reset
- `updatePassword(newPassword)` - Change password

### Notification Service ✅
- `getAllNotifications(options)` - Get all notifications with filters
- `getNotificationById(id)` - Get single notification
- `createNotification(data)` - Create new notification
- `markAsRead(id)` - Mark notification as read
- `markMultipleAsRead(ids)` - Mark multiple as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `deleteMultipleNotifications(ids)` - Delete multiple
- `deleteAllNotifications()` - Delete all notifications
- `getNotificationCount(options)` - Get notification count
- `subscribeToNotifications(callback)` - Real-time updates
- `unsubscribeFromNotifications(subscription)` - Unsubscribe

See `NOTIFICATIONS_INTEGRATION.md` for detailed documentation.

### Message Service ✅
- `getConversations(userId)` - Get all conversations
- `getConversationMessages(userId, partnerId)` - Get messages in conversation
- `sendMessage(data)` - Send new message
- `markAsRead(messageId)` - Mark message as read
- `markConversationAsRead(userId, partnerId)` - Mark all messages as read
- `deleteMessage(messageId)` - Delete message
- `searchMessages(userId, term)` - Search messages
- `getUnreadCount(userId)` - Get unread message count
- `subscribeToMessages(userId, callback)` - Real-time subscription
- `unsubscribeFromMessages(subscription)` - Unsubscribe

**See MESSAGE_CENTER_SETUP.md for detailed documentation and examples.**

### Help Service ✅
- `getAllFaqs()` - Get all FAQs grouped by category
- `getFaqCategories()` - Get FAQ categories
- `getFaqItemsByCategory(categoryId)` - Get FAQs by category
- `searchFaqs(searchTerm)` - Search FAQs
- `getHelpResources(options)` - Get help resources (tutorials, videos, guides)
- `createSupportTicket(ticketData)` - Create support ticket
- `getUserSupportTickets(userId, options)` - Get user's support tickets
- `replyToSupportTicket(ticketId, userId, message)` - Reply to ticket
- `trackHelpActivity(userId, resourceType, resourceId, action)` - Track user activity

**See HELP_SYSTEM_SETUP.md for detailed documentation and examples.**

## Next Steps

1. **Update each page** to use the corresponding service functions
2. **Add error handling** and loading states
3. **Implement authentication** on protected routes
4. **Add real-time subscriptions** (optional) using Supabase realtime
5. **Test each page** with real data

## Testing

You can test your services in the browser console:

```javascript
import { getAllProducts } from './services/productService';

// Test in console
getAllProducts().then(result => console.log(result));
```

## Environment Variables

Your `.env` file is already configured with:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

These are automatically loaded and used by all services.

