-- Add some scheduled products for testing
-- These will show up on the Scheduled page

INSERT INTO products (name, description, price, category, status, stock_quantity, image_url, published_at, created_at, updated_at)
VALUES
  (
    'Premium Wireless Headphones - Coming Soon',
    'High-quality wireless headphones with noise cancellation. Scheduled for Black Friday launch.',
    199.99,
    'Electronics',
    'scheduled',
    50,
    '/images/content/product-pic-1.jpg',
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
  ),
  (
    'Smart Fitness Tracker - Pre-Order',
    'Advanced fitness tracking with heart rate monitoring and GPS. Launching next week.',
    149.99,
    'Wearables',
    'scheduled',
    100,
    '/images/content/product-pic-2.jpg',
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
  ),
  (
    'Organic Cotton T-Shirt Collection',
    'Sustainable fashion collection launching for Earth Day.',
    29.99,
    'Clothing',
    'scheduled',
    200,
    '/images/content/product-pic-3.jpg',
    NOW() + INTERVAL '10 days',
    NOW(),
    NOW()
  ),
  (
    'Artisan Coffee Blend - Limited Edition',
    'Exclusive small-batch coffee blend. Release scheduled for weekend.',
    24.99,
    'Food & Beverage',
    'scheduled',
    75,
    '/images/content/product-pic-4.jpg',
    NOW() + INTERVAL '3 days',
    NOW(),
    NOW()
  ),
  (
    'Gaming Mouse - Pro Edition',
    'Professional gaming mouse with customizable RGB lighting. Launch scheduled for gaming expo.',
    79.99,
    'Gaming',
    'scheduled',
    150,
    '/images/content/product-pic-5.jpg',
    NOW() + INTERVAL '14 days',
    NOW(),
    NOW()
  );

SELECT 'Scheduled products seeded successfully!' AS status;
SELECT COUNT(*) AS total_scheduled FROM products WHERE status = 'scheduled';
