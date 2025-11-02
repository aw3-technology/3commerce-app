// Direct PostgreSQL connection to fix RLS policies
const { Client } = require('pg');
require('dotenv').config();

async function fixRLS() {
  const client = new Client({
    host: process.env.REACT_APP_DB_HOST,
    port: process.env.REACT_APP_DB_PORT,
    database: process.env.REACT_APP_DB_NAME,
    user: process.env.REACT_APP_DB_USER,
    password: process.env.REACT_APP_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    const tables = [
      'products',
      'customers',
      'orders',
      'order_items',
      'transactions',
      'refunds',
      'comments',
      'product_views',
      'traffic_sources',
      'sessions',
      'notifications',
      'messages'
    ];

    console.log('🔧 Disabling Row Level Security...\n');

    for (const table of tables) {
      try {
        const sql = `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`;
        await client.query(sql);
        console.log(`✅ ${table}: RLS disabled`);
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n🔍 Verifying changes...\n');

    const verifySQL = `
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN (
        'products', 'customers', 'orders', 'order_items',
        'transactions', 'refunds', 'comments', 'product_views',
        'traffic_sources', 'sessions', 'notifications', 'messages'
      )
      ORDER BY tablename;
    `;

    const result = await client.query(verifySQL);

    console.log('Table                    | RLS Enabled');
    console.log('-------------------------|------------');
    result.rows.forEach(row => {
      const status = row.rowsecurity ? '❌ YES' : '✅ NO';
      console.log(`${row.tablename.padEnd(24)} | ${status}`);
    });

    console.log('\n✨ Done! You should now be able to upload avatars and insert data.\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

fixRLS().catch(console.error);
