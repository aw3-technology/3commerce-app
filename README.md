# 3Commerce App

A comprehensive e-commerce marketplace dashboard built with React and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies (if not already done)
yarn install

# Start development server
yarn start

# Open http://localhost:3000
```

## ✅ Backend Setup Complete!

Your app is **fully connected** to Supabase PostgreSQL database!

### 📊 Database Tables Created:
- ✅ products
- ✅ customers
- ✅ orders & order_items
- ✅ transactions & refunds
- ✅ comments (reviews)
- ✅ product_views (analytics)
- ✅ traffic_sources
- ✅ sessions
- ✅ notifications
- ✅ messages

### 🔧 Services Available:
All service files are in `src/services/`:
- `authService.js` - User authentication
- `productService.js` - Product CRUD operations
- `customerService.js` - Customer management
- `orderService.js` - Orders & transactions
- `commentService.js` - Reviews & comments
- `analyticsService.js` - Dashboard analytics

## 📚 Documentation

**👉 See [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)** for:
- Complete integration examples
- How to use services in each page
- API function reference
- Page-to-service mapping

## 🗄️ Database Connection

- **Provider**: Supabase (PostgreSQL)
- **URL**: https://hglkohwfvbbdqloaniyw.supabase.co
- **Status**: ✅ Connected & Tables Created
- **Schema**: See `database-schema-simple.sql`

## 🔑 Environment Variables

Already configured in `.env`:
```
REACT_APP_SUPABASE_URL=https://hglkohwfvbbdqloaniyw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
```

## 📄 Pages & Routes

| Route | Page | Status |
|-------|------|--------|
| `/` | Dashboard (Home) | Ready for integration |
| `/products/dashboard` | Products Dashboard | Ready for integration |
| `/products/add` | New Product | Ready for integration |
| `/products/drafts` | Drafts | Ready for integration |
| `/products/released` | Released Products | Ready for integration |
| `/products/comments` | Comments | Ready for integration |
| `/customers/overview` | Customers Overview | Ready for integration |
| `/customers/customer-list` | Customer List | Ready for integration |
| `/income/earning` | Earnings | Ready for integration |
| `/income/refunds` | Refunds | Ready for integration |
| `/income/statements` | Statements | Ready for integration |
| `/sign-in` | Sign In | Ready for integration |
| `/sign-up` | Sign Up | Ready for integration |
| `/settings` | Settings | Ready for integration |

## 🛠️ Tech Stack

- **Frontend**: React 18.2
- **Routing**: React Router v6
- **Styling**: SASS/SCSS
- **Database**: Supabase (PostgreSQL)
- **ORM/Client**: @supabase/supabase-js
- **Build Tool**: Create React App

## 📖 Next Steps

1. **Integrate pages** - Follow examples in `BACKEND_INTEGRATION_GUIDE.md`
2. **Add authentication** - Protect routes with auth
3. **Test services** - Use browser console to test API calls
4. **Add error handling** - Implement proper error states
5. **Deploy** - Build and deploy to your hosting platform

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [React Documentation](https://reactjs.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Create React App Docs](https://create-react-app.dev/)

## 📦 Available Scripts

### `yarn start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `yarn build`
Builds the app for production to the `build` folder

### `yarn test`
Launches the test runner

---

**Repository**: https://github.com/aw3-technology/3commerce-app
