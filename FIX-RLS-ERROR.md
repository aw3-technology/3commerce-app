# Fix: Row Level Security (RLS) Policy Error

## Error Message
```
Failed to upload avatar: new row violates row-level security policy
```

## What's Happening?
Supabase has Row Level Security (RLS) enabled on your tables, which restricts who can read/write data. Your app is trying to insert/update data but doesn't have permission.

## Quick Fix (Recommended for Development)

### Option 1: Disable RLS (Fastest - For Development Only)

1. Go to your Supabase Dashboard: https://hglkohwfvbbdqloaniyw.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `fix-rls-policies.sql` (the first section)
5. Click "Run" or press Ctrl+Enter

**OR** just run this SQL:

```sql
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
```

### Option 2: Enable RLS with Permissive Policies (Better for Production)

If you want to keep RLS enabled but allow all operations:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... (repeat for other tables)

-- Create permissive policies
CREATE POLICY "Enable all access for products" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

-- ... (repeat for other tables)
```

The full SQL is in `fix-rls-policies.sql` (uncomment the Option 2 section).

## How to Apply the Fix

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left menu
   - Click "+ New Query"

3. **Run the SQL**
   - Paste the SQL from `fix-rls-policies.sql`
   - Click "Run" (or press Ctrl/Cmd + Enter)

4. **Verify**
   - You should see "Success. No rows returned"
   - Try uploading the avatar again - it should work now!

## Alternative: Using Supabase UI

You can also disable RLS through the UI:

1. Go to "Authentication" → "Policies" in Supabase Dashboard
2. For each table, toggle "Enable RLS" to OFF
3. Or create new policies with full access

## For Production

For a production app, you'll want proper RLS policies based on:
- Authenticated users only
- User-specific data access
- Role-based permissions

Example secure policy:
```sql
-- Only allow users to access their own data
CREATE POLICY "Users can access own data" ON customers
  FOR ALL USING (auth.uid() = user_id);
```

## Need Help?

If you continue to see RLS errors:
1. Check if the SQL ran successfully
2. Refresh your browser/app
3. Check the Supabase logs in Dashboard → Database → Logs
4. Verify the anon key has proper permissions

---

**Note**: Disabling RLS is fine for development but should be properly configured for production!
