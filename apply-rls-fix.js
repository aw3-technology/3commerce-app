// Script to fix RLS policies directly
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Fixing Row Level Security policies...\n');

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

  // Disable RLS for all tables
  for (const table of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: RLS disabled`);
      }
    } catch (err) {
      console.log(`⚠️  ${table}: ${err.message}`);
    }
  }

  console.log('\n✨ RLS policies updated!\n');
}

fixRLSPolicies().catch(console.error);
