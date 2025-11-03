/**
 * Script to clear all demo/sample data from the database
 * Run with: node scripts/clear-demo-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDemoData() {
  console.log('🗑️  Starting to clear demo data...\n');

  try {
    // 1. Clear order items first (foreign key dependency)
    console.log('Clearing order items...');
    const { error: orderItemsError, count: orderItemsCount } = await supabase
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (orderItemsError) {
      console.error('❌ Error clearing order items:', orderItemsError);
    } else {
      console.log(`✅ Cleared order items`);
    }

    // 2. Clear orders
    console.log('Clearing orders...');
    const { error: ordersError, count: ordersCount } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (ordersError) {
      console.error('❌ Error clearing orders:', ordersError);
    } else {
      console.log(`✅ Cleared orders`);
    }

    // 3. Clear product views
    console.log('Clearing product views...');
    const { error: viewsError, count: viewsCount } = await supabase
      .from('product_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (viewsError) {
      console.error('❌ Error clearing product views:', viewsError);
    } else {
      console.log(`✅ Cleared product views`);
    }

    // 4. Clear products
    console.log('Clearing products...');
    const { error: productsError, count: productsCount } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (productsError) {
      console.error('❌ Error clearing products:', productsError);
    } else {
      console.log(`✅ Cleared products`);
    }

    // 5. Clear customers (optional - commented out to preserve real customers)
    // console.log('Clearing customers...');
    // const { error: customersError } = await supabase
    //   .from('customers')
    //   .delete()
    //   .neq('id', '00000000-0000-0000-0000-000000000000');
    // if (customersError) {
    //   console.error('❌ Error clearing customers:', customersError);
    // } else {
    //   console.log(`✅ Cleared customers`);
    // }

    // 6. Clear messages
    console.log('Clearing messages...');
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (messagesError) {
      console.error('❌ Error clearing messages:', messagesError);
    } else {
      console.log(`✅ Cleared messages`);
    }

    // 7. Clear comments
    console.log('Clearing comments...');
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (commentsError) {
      console.error('❌ Error clearing comments:', commentsError);
    } else {
      console.log(`✅ Cleared comments`);
    }

    // 8. Clear sessions
    console.log('Clearing sessions...');
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (sessionsError) {
      console.error('❌ Error clearing sessions:', sessionsError);
    } else {
      console.log(`✅ Cleared sessions`);
    }

    console.log('\n✨ Demo data cleared successfully!');
    console.log('\n📝 Note: User accounts and profiles were preserved.');
    console.log('You can now start fresh with your own data.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Confirm before clearing
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This will delete ALL data from the following tables:');
console.log('  - Products');
console.log('  - Orders');
console.log('  - Order Items');
console.log('  - Product Views');
console.log('  - Messages');
console.log('  - Comments');
console.log('  - Sessions');
console.log('\n💡 User accounts and profiles will be preserved.\n');

readline.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    clearDemoData().then(() => {
      readline.close();
      process.exit(0);
    });
  } else {
    console.log('❌ Cancelled. No data was deleted.');
    readline.close();
    process.exit(0);
  }
});
