const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupUserProducts() {
  console.log('Setting up user-specific products...\n');

  try {
    // Step 1: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ No authenticated user found.');
      console.log('\nTo fix this:');
      console.log('1. Sign in to the app at http://localhost:3000/sign-in');
      console.log('2. Create an account if you haven\'t already');
      console.log('3. Run this script again\n');
      console.log('OR use the SQL script directly in Supabase:');
      console.log('   scripts/add-user-id-to-products.sql\n');
      return;
    }

    console.log(`✅ Authenticated as: ${user.email}`);
    console.log(`   User ID: ${user.id}\n`);

    // Step 2: Delete all existing products (to start fresh)
    console.log('Deleting existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('Note: Could not delete existing products:', deleteError.message);
    } else {
      console.log('✅ Existing products cleared\n');
    }

    // Step 3: Create sample products for this user
    const draftProducts = [
      {
        name: "Marketplace Dashboard UI Kit",
        description: "A comprehensive dashboard UI kit for marketplace applications with 50+ screens and components",
        price: 49.99,
        category: "UI design kit",
        status: "draft",
        stock_quantity: 100,
        sales_count: 0,
        image_url: "/images/content/product-pic-1.jpg",
        user_id: user.id
      },
      {
        name: "E-commerce Mobile App Template",
        description: "Modern mobile app design template for e-commerce applications",
        price: 39.99,
        category: "Mobile template",
        status: "draft",
        stock_quantity: 150,
        sales_count: 0,
        image_url: "/images/content/product-pic-2.jpg",
        user_id: user.id
      },
      {
        name: "SaaS Landing Page Collection",
        description: "Collection of 10 premium SaaS landing page designs",
        price: 29.99,
        category: "Web template",
        status: "draft",
        stock_quantity: 200,
        sales_count: 0,
        image_url: "/images/content/product-pic-3.jpg",
        user_id: user.id
      },
      {
        name: "Admin Dashboard Pro",
        description: "Professional admin dashboard with dark mode and 100+ components",
        price: 59.99,
        category: "UI design kit",
        status: "draft",
        stock_quantity: 75,
        sales_count: 0,
        image_url: "/images/content/product-pic-4.jpg",
        user_id: user.id
      },
      {
        name: "Icon Pack - 500+ Icons",
        description: "Premium icon pack with 500+ customizable icons in multiple formats",
        price: 19.99,
        category: "Icons",
        status: "draft",
        stock_quantity: 500,
        sales_count: 0,
        image_url: "/images/content/product-pic-5.jpg",
        user_id: user.id
      },
      {
        name: "Portfolio Website Template",
        description: "Creative portfolio template for designers and developers",
        price: 24.99,
        category: "Web template",
        status: "draft",
        stock_quantity: 120,
        sales_count: 0,
        image_url: "/images/content/product-pic-6.jpg",
        user_id: user.id
      },
      {
        name: "Finance App UI Kit",
        description: "Complete UI kit for financial and banking applications",
        price: 44.99,
        category: "UI design kit",
        status: "draft",
        stock_quantity: 90,
        sales_count: 0,
        image_url: "/images/content/product-pic-1.jpg",
        user_id: user.id
      },
      {
        name: "Illustration Bundle",
        description: "Hand-drawn illustration bundle with 100+ unique illustrations",
        price: 34.99,
        category: "Illustrations",
        status: "draft",
        stock_quantity: 250,
        sales_count: 0,
        image_url: "/images/content/product-pic-2.jpg",
        user_id: user.id
      }
    ];

    const publishedProducts = [
      {
        name: "3Commerce Dashboard",
        description: "Complete e-commerce dashboard with analytics and management features",
        price: 69.99,
        category: "UI design kit",
        status: "published",
        stock_quantity: 50,
        sales_count: 23,
        image_url: "/images/content/product-pic-1.jpg",
        published_at: new Date().toISOString(),
        user_id: user.id
      },
      {
        name: "Social Media Dashboard",
        description: "Dashboard template for social media management platforms",
        price: 54.99,
        category: "UI design kit",
        status: "published",
        stock_quantity: 80,
        sales_count: 15,
        image_url: "/images/content/product-pic-3.jpg",
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        name: "Project Management UI",
        description: "Modern project management interface with task tracking",
        price: 49.99,
        category: "UI design kit",
        status: "published",
        stock_quantity: 100,
        sales_count: 31,
        image_url: "/images/content/product-pic-4.jpg",
        published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        name: "Medical App Template",
        description: "Healthcare and medical appointment booking app template",
        price: 59.99,
        category: "Mobile template",
        status: "published",
        stock_quantity: 60,
        sales_count: 12,
        image_url: "/images/content/product-pic-5.jpg",
        published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        name: "Food Delivery App UI",
        description: "Complete food delivery app design with customer and driver interfaces",
        price: 64.99,
        category: "Mobile template",
        status: "published",
        stock_quantity: 70,
        sales_count: 27,
        image_url: "/images/content/product-pic-6.jpg",
        published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      }
    ];

    const scheduledProducts = [
      {
        name: "Fitness App UI Kit",
        description: "Comprehensive fitness and workout tracking app design",
        price: 44.99,
        category: "Mobile template",
        status: "scheduled",
        stock_quantity: 100,
        sales_count: 0,
        image_url: "/images/content/product-pic-2.jpg",
        published_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      },
      {
        name: "Real Estate Platform UI",
        description: "Property listing and real estate marketplace design",
        price: 54.99,
        category: "Web template",
        status: "scheduled",
        stock_quantity: 85,
        sales_count: 0,
        image_url: "/images/content/product-pic-3.jpg",
        published_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: user.id
      }
    ];

    const allProducts = [
      ...draftProducts,
      ...publishedProducts,
      ...scheduledProducts
    ];

    console.log(`Inserting ${allProducts.length} products for ${user.email}...`);
    console.log(`- ${draftProducts.length} draft products`);
    console.log(`- ${publishedProducts.length} published products`);
    console.log(`- ${scheduledProducts.length} scheduled products\n`);

    // Insert products
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(allProducts)
      .select();

    if (insertError) {
      console.error('❌ Error inserting products:', insertError);

      if (insertError.message.includes('user_id')) {
        console.log('\n⚠️  The products table needs the user_id column.');
        console.log('Run this SQL in Supabase SQL Editor:\n');
        console.log('ALTER TABLE products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;');
        console.log('CREATE INDEX idx_products_user_id ON products(user_id);\n');
      }

      return;
    }

    console.log('✅ Successfully created products!');
    console.log(`\nTotal products: ${data.length}`);
    console.log(`Owner: ${user.email}`);
    console.log('\nYou can now view your products at:');
    console.log('- Drafts: http://localhost:3000/products/drafts');
    console.log('- Published: http://localhost:3000/products/released');
    console.log('- Scheduled: http://localhost:3000/products/scheduled');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
setupUserProducts();
