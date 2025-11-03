const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample product data
const draftProducts = [
  {
    name: "Marketplace Dashboard UI Kit",
    description: "A comprehensive dashboard UI kit for marketplace applications with 50+ screens and components",
    price: 49.99,
    category: "UI design kit",
    status: "draft",
    stock_quantity: 100,
    sales_count: 0,
    image_url: "/images/content/product-pic-1.jpg"
  },
  {
    name: "E-commerce Mobile App Template",
    description: "Modern mobile app design template for e-commerce applications",
    price: 39.99,
    category: "Mobile template",
    status: "draft",
    stock_quantity: 150,
    sales_count: 0,
    image_url: "/images/content/product-pic-2.jpg"
  },
  {
    name: "SaaS Landing Page Collection",
    description: "Collection of 10 premium SaaS landing page designs",
    price: 29.99,
    category: "Web template",
    status: "draft",
    stock_quantity: 200,
    sales_count: 0,
    image_url: "/images/content/product-pic-3.jpg"
  },
  {
    name: "Admin Dashboard Pro",
    description: "Professional admin dashboard with dark mode and 100+ components",
    price: 59.99,
    category: "UI design kit",
    status: "draft",
    stock_quantity: 75,
    sales_count: 0,
    image_url: "/images/content/product-pic-4.jpg"
  },
  {
    name: "Icon Pack - 500+ Icons",
    description: "Premium icon pack with 500+ customizable icons in multiple formats",
    price: 19.99,
    category: "Icons",
    status: "draft",
    stock_quantity: 500,
    sales_count: 0,
    image_url: "/images/content/product-pic-5.jpg"
  },
  {
    name: "Portfolio Website Template",
    description: "Creative portfolio template for designers and developers",
    price: 24.99,
    category: "Web template",
    status: "draft",
    stock_quantity: 120,
    sales_count: 0,
    image_url: "/images/content/product-pic-6.jpg"
  },
  {
    name: "Finance App UI Kit",
    description: "Complete UI kit for financial and banking applications",
    price: 44.99,
    category: "UI design kit",
    status: "draft",
    stock_quantity: 90,
    sales_count: 0,
    image_url: "/images/content/product-pic-1.jpg"
  },
  {
    name: "Illustration Bundle",
    description: "Hand-drawn illustration bundle with 100+ unique illustrations",
    price: 34.99,
    category: "Illustrations",
    status: "draft",
    stock_quantity: 250,
    sales_count: 0,
    image_url: "/images/content/product-pic-2.jpg"
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
    published_at: new Date().toISOString()
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
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
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
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
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
    published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
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
    published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
    published_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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
    published_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

async function insertSampleProducts() {
  console.log('Starting to insert sample product data...');

  try {
    // Combine all products
    const allProducts = [
      ...draftProducts,
      ...publishedProducts,
      ...scheduledProducts
    ];

    console.log(`Inserting ${allProducts.length} sample products...`);
    console.log(`- ${draftProducts.length} draft products`);
    console.log(`- ${publishedProducts.length} published products`);
    console.log(`- ${scheduledProducts.length} scheduled products`);

    // Insert all products
    const { data, error } = await supabase
      .from('products')
      .insert(allProducts)
      .select();

    if (error) {
      console.error('❌ Error inserting products:', error);

      // If RLS is blocking, provide helpful message
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        console.log('\n⚠️  Row Level Security is blocking the insert.');
        console.log('Options:');
        console.log('1. Sign in to the app first, then run this script');
        console.log('2. Temporarily disable RLS for testing:');
        console.log('   ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
        console.log('3. Insert products manually in Supabase dashboard');
      }

      throw error;
    }

    console.log('✅ Successfully inserted all sample products!');
    console.log(`\nTotal products created: ${data.length}`);
    console.log('\nBreakdown by status:');
    console.log(`- Draft: ${draftProducts.length} products (viewable at /products/drafts)`);
    console.log(`- Published: ${publishedProducts.length} products (viewable at /products/released)`);
    console.log(`- Scheduled: ${scheduledProducts.length} products (viewable at /products/scheduled)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
insertSampleProducts();
