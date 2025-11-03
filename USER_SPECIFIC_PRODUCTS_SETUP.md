# User-Specific Products Setup Guide

## Overview

You're absolutely right! Products should be specific to each user profile. This guide will help you set up user-specific products so each authenticated user only sees their own products.

## What Changed

### 1. Database Schema Update
- Added `user_id` column to `products` table
- Links each product to the user who created it
- Foreign key to `auth.users(id)` table

### 2. Row Level Security (RLS) Policies
- Users can only view their own products
- Users can only create products for themselves
- Users can only update/delete their own products
- Complete data isolation between users

### 3. Product Service Updates
- Automatically adds `user_id` when creating products
- Checks authentication before creating products
- RLS automatically filters queries to current user

## Setup Steps

### Step 1: Add user_id Column to Products Table

You need to run SQL in your Supabase Dashboard. Here's how:

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this SQL:**

\`\`\`sql
-- Add user_id column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Enable read access for orders" ON products;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = user_id);
\`\`\`

4. **Click "Run"** to execute the SQL

5. **Verify Success**
   - You should see "Success. No rows returned"
   - Check the products table structure to confirm `user_id` column exists

### Step 2: Create Products for Your User

Now that the schema is updated, you need to sign in and create products for your account.

1. **Sign in to the app:**
   - Go to http://localhost:3000/sign-in
   - Sign in with your existing account OR
   - Create a new account at http://localhost:3000/sign-up

2. **Run the setup script:**

\`\`\`bash
node scripts/setup-user-products.js
\`\`\`

This script will:
- Check if you're authenticated
- Delete old products (from before user_id was added)
- Create 15 new products linked to your user account:
  - 8 draft products
  - 5 published products
  - 2 scheduled products

### Step 3: Verify It Works

1. **View Your Products:**
   - Drafts: http://localhost:3000/products/drafts
   - Published: http://localhost:3000/products/released
   - Scheduled: http://localhost:3000/products/scheduled

2. **Test Multi-User Isolation:**
   - Create a second account
   - Sign in with the new account
   - Run `setup-user-products.js` again
   - You'll see different products for each user!

## How It Works

### User Authentication Flow

\`\`\`
User signs in
    ↓
Auth token stored in browser
    ↓
Product queries sent to Supabase
    ↓
RLS checks auth.uid() = product.user_id
    ↓
Only matching products returned
\`\`\`

### Creating Products

When a user creates a product:

\`\`\`javascript
// User creates product
await createProduct({
  name: "My Product",
  price: 29.99,
  status: "draft"
});

// Service automatically adds user_id
const { data: { user } } = await supabase.auth.getUser();

await supabase.from('products').insert({
  name: "My Product",
  price: 29.99,
  status: "draft",
  user_id: user.id  // ← Automatically added
});
\`\`\`

### Fetching Products

When fetching products:

\`\`\`javascript
// User requests drafts
await getProductsByStatus('draft');

// Supabase query runs
SELECT * FROM products WHERE status = 'draft';

// RLS policy automatically adds:
// AND user_id = auth.uid()

// User only sees their own draft products
\`\`\`

## Benefits

### 1. Data Isolation
- Each user has their own product catalog
- Users cannot see or modify other users' products
- Perfect for multi-vendor marketplace

### 2. Security
- Database-level security via RLS
- Cannot bypass even with direct database access
- Automatic filtering on all queries

### 3. Scalability
- Single products table for all users
- Efficient indexing on user_id
- Clean multi-tenant architecture

## Troubleshooting

### Issue: "No products found" after setup

**Cause:** Not signed in or products not created for your user

**Solution:**
1. Ensure you're signed in
2. Run: `node scripts/setup-user-products.js`
3. Refresh the page

### Issue: "user_id column does not exist"

**Cause:** SQL migration not run yet

**Solution:**
1. Run the SQL from Step 1 in Supabase Dashboard
2. Verify column exists in Table Editor
3. Try again

### Issue: "User must be authenticated to create products"

**Cause:** Not signed in when creating product

**Solution:**
1. Sign in at http://localhost:3000/sign-in
2. Try creating product again

### Issue: "Row level security policy violated"

**Cause:** Trying to access another user's products

**Solution:**
- This is expected behavior!
- You can only access your own products
- Sign in with the correct account

### Issue: Old products still showing

**Cause:** Products created before user_id was added

**Solution:**
1. Delete old products manually in Supabase Dashboard
2. Or run: `DELETE FROM products WHERE user_id IS NULL;`
3. Create new products with setup script

## Testing Multi-User Setup

### Test 1: Create Two Users

1. Sign up as user1@example.com
2. Run setup script → Creates 15 products for user1
3. Sign out
4. Sign up as user2@example.com
5. Run setup script → Creates 15 products for user2

### Test 2: Verify Isolation

1. Sign in as user1@example.com
2. Go to /products/drafts
3. See 8 products
4. Sign out
5. Sign in as user2@example.com
6. Go to /products/drafts
7. See 8 DIFFERENT products

### Test 3: Product Creation

1. Sign in as user1
2. Create a new product
3. Verify it appears in your list
4. Sign out
5. Sign in as user2
6. Verify user1's new product is NOT visible

## Database Schema

### Updated Products Table

\`\`\`sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    stock_quantity INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE  -- NEW!
);

CREATE INDEX idx_products_user_id ON products(user_id);
\`\`\`

### RLS Policies

\`\`\`sql
-- SELECT: View own products only
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Create products for yourself only
CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Modify your own products only
CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Delete your own products only
CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = user_id);
\`\`\`

## Files Created/Modified

### Created:
- `scripts/add-user-id-to-products.sql` - SQL migration file
- `scripts/migrate-products-schema.js` - Migration helper script
- `scripts/setup-user-products.js` - User-specific product creator
- `USER_SPECIFIC_PRODUCTS_SETUP.md` - This documentation

### Modified:
- `src/services/productService.js` - Auto-adds user_id on creation

## Next Steps

### 1. Update Other Tables
Apply the same user_id pattern to:
- `customers` table (already has user_id)
- `orders` table
- `comments` table
- Other user-specific data

### 2. Add User Profile Features
- Display user's total products
- Show user's revenue stats
- User-specific analytics

### 3. Multi-Vendor Features
- Public product marketplace (all users' products)
- Vendor profiles
- Revenue sharing

## Quick Start Checklist

- [ ] Run SQL migration in Supabase Dashboard
- [ ] Sign in to the app
- [ ] Run `node scripts/setup-user-products.js`
- [ ] View products at /products/drafts
- [ ] Verify only your products appear
- [ ] Create a second account to test isolation

## Support

For Supabase RLS documentation:
- https://supabase.com/docs/guides/auth/row-level-security

For authentication:
- See `AUTH_SETUP_COMPLETE.md`

For product service:
- See `src/services/productService.js`
