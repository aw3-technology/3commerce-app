// Quick script to check if database tables exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Checking database connection and tables...\n');

  const tablesToCheck = [
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

  console.log('Database URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('\n📊 Checking tables:\n');

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: NOT FOUND or NO ACCESS`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err.message}`);
    }
  }

  console.log('\n🔍 Checking for sample data in key tables:\n');

  // Check products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(3);

  if (!productsError && products) {
    console.log(`📦 Products (${products.length} samples):`);
    products.forEach(p => console.log(`   - ${p.name}: $${p.price}`));
  } else {
    console.log('📦 Products: No data or error');
  }

  // Check customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, name, email')
    .limit(3);

  if (!customersError && customers) {
    console.log(`\n👥 Customers (${customers.length} samples):`);
    customers.forEach(c => console.log(`   - ${c.name} (${c.email})`));
  } else {
    console.log('\n👥 Customers: No data or error');
  }

  // Check orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total_amount, status')
    .limit(3);

  if (!ordersError && orders) {
    console.log(`\n🛒 Orders (${orders.length} samples):`);
    orders.forEach(o => console.log(`   - $${o.total_amount} - ${o.status}`));
  } else {
    console.log('\n🛒 Orders: No data or error');
  }

  console.log('\n✨ Check complete!\n');
}

checkTables().catch(console.error);
