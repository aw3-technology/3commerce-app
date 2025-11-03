const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  console.log('🔧 Running database migration...\n');

  // Database connection config
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
    // Connect to database
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Run migration
    console.log('Adding user_id column to products table...');

    const migration = `
      -- Add user_id column to products table
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Create an index for better query performance
      CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    `;

    await client.query(migration);
    console.log('✅ Column added successfully\n');

    // Update RLS policies
    console.log('Configuring Row Level Security policies...');

    const rlsPolicies = `
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

    await client.query(rlsPolicies);
    console.log('✅ RLS policies configured\n');

    // Verify the changes
    console.log('Verifying migration...');
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = 'user_id'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Migration verified successfully!');
      console.log(`   Column: ${result.rows[0].column_name}`);
      console.log(`   Type: ${result.rows[0].data_type}\n`);
    }

    console.log('🎉 Migration complete!\n');
    console.log('Next steps:');
    console.log('1. Sign in to the app: http://localhost:3000/sign-in');
    console.log('2. Run: node scripts/setup-user-products.js');
    console.log('3. View your products at /products/drafts\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n✅ Column already exists! No action needed.');
      console.log('You can proceed to: node scripts/setup-user-products.js\n');
    }
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

runMigration();
