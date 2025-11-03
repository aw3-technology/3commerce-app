const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key if available, otherwise use anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSchema() {
  console.log('📦 Migrating products table schema...\n');

  console.log('⚠️  This script requires manual SQL execution in Supabase Dashboard.\n');
  console.log('Please follow these steps:\n');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Create a new query');
  console.log('5. Copy and paste the following SQL:\n');
  console.log('---SQL START---\n');

  const sql = `
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
`;

  console.log(sql);
  console.log('\n---SQL END---\n');
  console.log('6. Click "Run" to execute the SQL');
  console.log('7. After successful execution, run: node scripts/setup-user-products.js\n');

  // Try to verify if the column exists (will work even without service role)
  try {
    const { data, error } = await supabase
      .from('products')
      .select('user_id')
      .limit(1);

    if (error) {
      if (error.message.includes('user_id')) {
        console.log('❌ Confirmed: user_id column does not exist yet.');
        console.log('   Please run the SQL above in Supabase Dashboard.\n');
      } else {
        console.log('⚠️  Error checking schema:', error.message);
      }
    } else {
      console.log('✅ user_id column already exists!');
      console.log('   You can now run: node scripts/setup-user-products.js\n');
    }
  } catch (err) {
    console.log('Note: Could not verify schema:', err.message);
  }
}

migrateSchema();
