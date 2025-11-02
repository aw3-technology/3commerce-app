-- Fix Row Level Security (RLS) Policies for 3Commerce
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- DISABLE RLS for development (Option 1 - Quick Fix)
-- ============================================
-- This is the quickest solution for development
-- WARNING: Only use this in development, not production!

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OR: Enable RLS with permissive policies (Option 2 - Better)
-- ============================================
-- Uncomment these if you want RLS enabled with full access policies
-- This is more secure but still allows all operations

/*
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all access for products" ON products;
DROP POLICY IF EXISTS "Enable all access for customers" ON customers;
DROP POLICY IF EXISTS "Enable all access for orders" ON orders;
DROP POLICY IF EXISTS "Enable all access for order_items" ON order_items;
DROP POLICY IF EXISTS "Enable all access for transactions" ON transactions;
DROP POLICY IF EXISTS "Enable all access for refunds" ON refunds;
DROP POLICY IF EXISTS "Enable all access for comments" ON comments;
DROP POLICY IF EXISTS "Enable all access for product_views" ON product_views;
DROP POLICY IF EXISTS "Enable all access for traffic_sources" ON traffic_sources;
DROP POLICY IF EXISTS "Enable all access for sessions" ON sessions;
DROP POLICY IF EXISTS "Enable all access for notifications" ON notifications;
DROP POLICY IF EXISTS "Enable all access for messages" ON messages;

-- Create permissive policies for all operations (development)
-- Products
CREATE POLICY "Enable all access for products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Customers
CREATE POLICY "Enable all access for customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "Enable all access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
CREATE POLICY "Enable all access for order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Transactions
CREATE POLICY "Enable all access for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- Refunds
CREATE POLICY "Enable all access for refunds" ON refunds FOR ALL USING (true) WITH CHECK (true);

-- Comments
CREATE POLICY "Enable all access for comments" ON comments FOR ALL USING (true) WITH CHECK (true);

-- Product Views
CREATE POLICY "Enable all access for product_views" ON product_views FOR ALL USING (true) WITH CHECK (true);

-- Traffic Sources
CREATE POLICY "Enable all access for traffic_sources" ON traffic_sources FOR ALL USING (true) WITH CHECK (true);

-- Sessions
CREATE POLICY "Enable all access for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Enable all access for notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Messages
CREATE POLICY "Enable all access for messages" ON messages FOR ALL USING (true) WITH CHECK (true);
*/

-- ============================================
-- Verify the changes
-- ============================================
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'products', 'customers', 'orders', 'order_items',
  'transactions', 'refunds', 'comments', 'product_views',
  'traffic_sources', 'sessions', 'notifications', 'messages'
);
