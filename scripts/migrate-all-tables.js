const { Client } = require('pg');
require('dotenv').config();

async function migrateAllTables() {
  console.log('🔧 Adding user_id to all user-specific tables...\n');

  const client = new Client({
    host: process.env.REACT_APP_DB_HOST,
    port: process.env.REACT_APP_DB_PORT || 5432,
    database: process.env.REACT_APP_DB_NAME,
    user: process.env.REACT_APP_DB_USER,
    password: process.env.REACT_APP_DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Migration SQL
    const migration = `
      -- Add user_id to customers table
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Add user_id to orders table (orders belong to the seller/vendor, not the customer)
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Add user_id to transactions table
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Add user_id to refunds table
      ALTER TABLE refunds
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Add user_id to comments table
      ALTER TABLE comments
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Add user_id to product_views table
      ALTER TABLE product_views
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
      CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
    `;

    console.log('Adding user_id columns to tables...');
    await client.query(migration);
    console.log('✅ Columns added successfully\n');

    // RLS Policies
    console.log('Configuring Row Level Security policies...');

    const rlsPolicies = `
      -- Enable RLS on all tables
      ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
      ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies
      DROP POLICY IF EXISTS "Users can view their customers" ON customers;
      DROP POLICY IF EXISTS "Users can insert customers" ON customers;
      DROP POLICY IF EXISTS "Users can update customers" ON customers;
      DROP POLICY IF EXISTS "Users can delete customers" ON customers;

      DROP POLICY IF EXISTS "Users can view their orders" ON orders;
      DROP POLICY IF EXISTS "Users can insert orders" ON orders;
      DROP POLICY IF EXISTS "Users can update orders" ON orders;

      DROP POLICY IF EXISTS "Users can view their transactions" ON transactions;
      DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;

      DROP POLICY IF EXISTS "Users can view their refunds" ON refunds;
      DROP POLICY IF EXISTS "Users can insert refunds" ON refunds;
      DROP POLICY IF EXISTS "Users can update refunds" ON refunds;

      DROP POLICY IF EXISTS "Users can view their comments" ON comments;
      DROP POLICY IF EXISTS "Users can insert comments" ON comments;
      DROP POLICY IF EXISTS "Users can update comments" ON comments;

      DROP POLICY IF EXISTS "Users can view their product_views" ON product_views;
      DROP POLICY IF EXISTS "Users can insert product_views" ON product_views;

      -- Customers policies
      CREATE POLICY "Users can view their customers" ON customers
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert customers" ON customers
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update customers" ON customers
          FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete customers" ON customers
          FOR DELETE USING (auth.uid() = user_id);

      -- Orders policies
      CREATE POLICY "Users can view their orders" ON orders
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert orders" ON orders
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update orders" ON orders
          FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete orders" ON orders
          FOR DELETE USING (auth.uid() = user_id);

      -- Transactions policies
      CREATE POLICY "Users can view their transactions" ON transactions
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert transactions" ON transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Refunds policies
      CREATE POLICY "Users can view their refunds" ON refunds
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert refunds" ON refunds
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update refunds" ON refunds
          FOR UPDATE USING (auth.uid() = user_id);

      -- Comments policies
      CREATE POLICY "Users can view their comments" ON comments
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert comments" ON comments
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update comments" ON comments
          FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete comments" ON comments
          FOR DELETE USING (auth.uid() = user_id);

      -- Product Views policies
      CREATE POLICY "Users can view their product_views" ON product_views
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert product_views" ON product_views
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;

    await client.query(rlsPolicies);
    console.log('✅ RLS policies configured\n');

    // Verify changes
    console.log('Verifying migration...');
    const result = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name = 'user_id'
        AND table_name IN ('customers', 'orders', 'transactions', 'refunds', 'comments', 'product_views')
      ORDER BY table_name
    `);

    console.log('✅ Migration verified!\n');
    console.log('Tables with user_id column:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 All tables migrated successfully!\n');
    console.log('Next steps:');
    console.log('1. Sign in to the app: http://localhost:3000/sign-in');
    console.log('2. Run: node scripts/setup-user-products.js');
    console.log('3. All data will now be user-specific!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n✅ Columns already exist! Migration likely already completed.');
      console.log('You can proceed with using the app.\n');
    }
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

migrateAllTables();
