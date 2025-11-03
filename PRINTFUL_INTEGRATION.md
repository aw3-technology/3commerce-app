# Printful API Integration Documentation

## Overview

This document describes the Printful print-on-demand integration for 3Commerce. The integration enables users to:
- Browse Printful's product catalog
- Create print-on-demand products
- Automatically fulfill orders through Printful
- Track order status and shipping information

## Table of Contents

1. [Setup](#setup)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Environment Configuration

The Printful API token is stored in your `.env` file:

```env
REACT_APP_PRINTFUL_API_TOKEN=your_printful_api_token_here
```

**To get your API token:**
1. Log in to your [Printful Dashboard](https://www.printful.com/dashboard)
2. Go to Settings → Stores
3. Select your store
4. Navigate to API section
5. Generate or copy your API token

### 2. Database Schema

Run the database migration to create the required tables:

```bash
# In Supabase SQL Editor, run:
psql -f printful-schema.sql
```

This creates the following tables:
- `printful_products` - Maps local products to Printful products
- `printful_orders` - Tracks Printful order fulfillment
- `printful_webhook_events` - Logs webhook events from Printful

Also adds columns to the existing `products` table:
- `is_printful_product` (BOOLEAN)
- `printful_metadata` (JSONB)

### 3. Test the Connection

1. Navigate to **Settings → Integrations**
2. Click "Test Connection" button
3. Verify that the connection status shows "Connected"
4. Review your store information displayed on the page

---

## Architecture

### Service Layer

The integration follows the existing service-oriented architecture:

```
src/services/
├── printfulClient.js          # Base API client with authentication
├── printfulService.js         # Product catalog & order operations
└── printfulOrderService.js    # Order fulfillment logic
```

### Components

```
src/components/
└── PrintfulBrowser/           # Product catalog browser modal
    ├── index.js
    └── PrintfulBrowser.module.sass

src/screens/
├── Settings/Printful/         # Integration settings page
└── NewProduct/PrintfulProduct/ # Product creation component
```

### Data Flow

```
User Creates Product
    ↓
Selects Printful Product from Catalog
    ↓
Product Saved with Printful Metadata
    ↓
Customer Places Order
    ↓
Order Sent to Printful API
    ↓
Printful Fulfills Order
    ↓
Webhook Updates Order Status
    ↓
Customer Receives Tracking Info
```

---

## Features

### 1. Product Creation

**Location:** New Product page

Users can:
- Enable Printful fulfillment for products
- Browse Printful's catalog of 200+ products
- Filter products by category
- Search products by name
- Select multiple product variants (colors, sizes)
- Auto-populate product name, description, and images from Printful

### 2. Order Fulfillment

**Automatic Process:**

When a customer purchases a Printful product:
1. Local order is created in your database
2. Order is automatically submitted to Printful
3. Printful processes and ships the order
4. Webhooks update your order status
5. Customer receives tracking information

### 3. Order Tracking

Track order status through these stages:
- **draft** - Order created but not confirmed
- **pending** - Submitted to Printful, awaiting processing
- **inprocess** - Printful is printing/packing
- **fulfilled** - Shipped with tracking number
- **cancelled** - Order cancelled or failed

### 4. Integration Management

**Location:** Settings → Integrations

Features:
- Connection status indicator
- Store information display
- API token configuration instructions
- Connection testing

---

## Usage Guide

### Creating a Printful Product

1. **Navigate to New Product**
   - Go to the "New Product" page
   - Fill in basic product information

2. **Enable Printful Integration**
   - Scroll to "Print-on-Demand (Printful)" section
   - Check "Enable Printful fulfillment"
   - Click "Browse Printful Products"

3. **Select Product**
   - Browse or search for products
   - Filter by category
   - Click on a product to select it

4. **Choose Variants**
   - Select colors, sizes, or other variants
   - Each variant shows its base cost
   - Select multiple variants to offer customers options

5. **Set Pricing**
   - Printful cost is the base price
   - Set your retail price in the Price section
   - Consider shipping and markup

6. **Publish**
   - Click "Publish" to make the product live
   - Product will have unlimited stock (fulfilled on-demand)

### Processing Orders

Orders are automatically fulfilled when:
- Customer purchases a product marked as `is_printful_product: true`
- Order status is set to "processing"
- Order details are sent to Printful API

**Manual fulfillment** (if needed):

```javascript
import { fulfillOrderWithPrintful } from './services/printfulOrderService';

const result = await fulfillOrderWithPrintful(orderId, {
  customerName: "John Doe",
  email: "john@example.com",
  shippingAddress: "123 Main St",
  city: "New York",
  state: "NY",
  country: "US",
  postalCode: "10001",
  phone: "+1234567890",
  shippingCost: 5.99,
  tax: 2.50
});
```

### Monitoring Orders

Check Printful order status:

```javascript
import { getPrintfulOrderStatus } from './services/printfulOrderService';

const { data, error } = await getPrintfulOrderStatus(orderId);

if (data) {
  console.log('Status:', data.status);
  console.log('Tracking:', data.tracking_number);
  console.log('Carrier:', data.carrier);
}
```

---

## API Reference

### Printful Service Functions

#### Product Catalog

```javascript
// Get all available products
const { data, error } = await getProducts();

// Get specific product details with variants
const { data, error } = await getProduct(productId);

// Get product variants
const { data, error } = await getProductVariants(productId);
```

#### Sync Products (Your Store Products)

```javascript
// Get all sync products
const { data, error } = await getSyncProducts();

// Create sync product
const { data, error } = await createSyncProduct({
  sync_product: {
    name: "My T-Shirt",
    thumbnail: "https://..."
  },
  sync_variants: [
    {
      variant_id: 4011,
      retail_price: "29.99",
      files: [
        {
          url: "https://...",
          position: "front"
        }
      ]
    }
  ]
});

// Update sync product
const { data, error } = await updateSyncProduct(syncProductId, productData);

// Delete sync product
const { data, error } = await deleteSyncProduct(syncProductId);
```

#### Orders

```javascript
// Create order (estimate costs)
const { data, error } = await createOrder(orderData, false);

// Create and confirm order
const { data, error } = await createOrder(orderData, true);

// Get order details
const { data, error } = await getOrder(orderId);

// Get all orders
const { data, error } = await getOrders({ status: 'fulfilled', limit: 20 });

// Confirm draft order
const { data, error } = await confirmOrder(orderId);

// Cancel order
const { data, error } = await cancelOrder(orderId);
```

#### Shipping

```javascript
// Calculate shipping rates
const { data, error } = await getShippingRates({
  recipient: {
    address1: "123 Main St",
    city: "New York",
    state_code: "NY",
    country_code: "US",
    zip: "10001"
  },
  items: [
    { variant_id: 4011, quantity: 1 }
  ]
});

// Get countries list
const { data, error } = await getCountries();

// Get tax rate
const { data, error } = await getTaxRate({
  country_code: "US",
  state_code: "NY"
});
```

#### Mockups

```javascript
// Generate product mockup
const { data, error } = await generateMockup(productId, variantId, [
  {
    placement: "front",
    image_url: "https://..."
  }
]);

// Get mockup generation status
const { data, error } = await getMockupTask(taskKey);
```

### Order Fulfillment Service

```javascript
import {
  fulfillOrderWithPrintful,
  handlePrintfulWebhook,
  getPrintfulOrderStatus
} from './services/printfulOrderService';

// Fulfill order
const result = await fulfillOrderWithPrintful(orderId, orderData);

// Handle webhook (server-side)
const result = await handlePrintfulWebhook(webhookPayload);

// Get order status
const result = await getPrintfulOrderStatus(orderId);
```

---

## Database Schema

### printful_products

Stores mappings between local products and Printful catalog items.

```sql
CREATE TABLE printful_products (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    product_id UUID REFERENCES products(id),
    printful_product_id BIGINT,        -- Catalog product ID
    printful_variant_id BIGINT,        -- Variant ID
    printful_sync_product_id BIGINT,   -- Sync product ID
    printful_sync_variant_id BIGINT,   -- Sync variant ID
    cost DECIMAL(10, 2),               -- Printful base cost
    retail_price DECIMAL(10, 2),       -- Your retail price
    files JSONB,                        -- Design files
    options JSONB,                      -- Print options
    mockup_urls JSONB,                  -- Mockup images
    is_active BOOLEAN,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### printful_orders

Tracks orders submitted to Printful for fulfillment.

```sql
CREATE TABLE printful_orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id),
    printful_order_id VARCHAR(255),     -- External ID
    printful_internal_id BIGINT,        -- Printful's internal ID
    status VARCHAR(50),                 -- Order status
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    carrier VARCHAR(100),
    service VARCHAR(100),
    shipments JSONB,                    -- Shipment details
    costs JSONB,                        -- Cost breakdown
    retail_costs JSONB,                 -- Retail pricing
    items JSONB,                        -- Order items
    recipient JSONB,                    -- Shipping address
    estimated_fulfillment TIMESTAMP,
    shipped_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### printful_webhook_events

Logs webhook events received from Printful.

```sql
CREATE TABLE printful_webhook_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100),           -- Event type
    printful_order_id VARCHAR(255),
    order_id UUID REFERENCES orders(id),
    payload JSONB,                      -- Full webhook payload
    processed BOOLEAN,
    processed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP
);
```

### products (extended)

Added columns to existing products table:

```sql
ALTER TABLE products
    ADD COLUMN is_printful_product BOOLEAN DEFAULT FALSE,
    ADD COLUMN printful_metadata JSONB;
```

**printful_metadata structure:**
```json
{
  "product_id": 71,
  "product_name": "Unisex Staple T-Shirt",
  "variants": [
    {
      "id": 4011,
      "name": "Small / Black",
      "price": "11.50",
      "color": "Black",
      "size": "S"
    }
  ]
}
```

---

## Troubleshooting

### Connection Issues

**Problem:** "Connection Failed" in Settings

**Solutions:**
1. Verify API token is correct in `.env` file
2. Restart your development server after changing `.env`
3. Check Printful dashboard for API access
4. Ensure token has proper permissions

```bash
# Restart server
npm start
```

### Product Not Appearing

**Problem:** Printful products don't load in browser

**Solutions:**
1. Check browser console for errors
2. Verify API token is valid
3. Check network tab for failed requests
4. Try selecting a different product category

### Order Fulfillment Fails

**Problem:** Orders not being sent to Printful

**Checklist:**
- [ ] Product has `is_printful_product: true`
- [ ] Product has valid `printful_metadata`
- [ ] Customer address is complete
- [ ] Order status is "processing"
- [ ] Printful account has sufficient credit

**Debug:**
```javascript
// Check product settings
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();

console.log('Is Printful:', product.is_printful_product);
console.log('Metadata:', product.printful_metadata);
```

### Webhook Not Working

**Problem:** Order status not updating automatically

**Setup Webhook URL:**
1. Go to Printful Dashboard → Settings → Stores
2. Select your store
3. Add webhook URL: `https://yourapp.com/api/printful-webhook`
4. Enable events: `package_shipped`, `package_returned`, `order_failed`

**Implement Webhook Endpoint:**
```javascript
// Server-side endpoint (example using Express)
app.post('/api/printful-webhook', async (req, res) => {
  const webhookPayload = req.body;

  const result = await handlePrintfulWebhook(webhookPayload);

  if (result.error) {
    return res.status(500).json({ error: result.error.message });
  }

  res.json({ success: true });
});
```

### Price Calculation

**Problem:** Need to calculate retail price with markup

**Helper Function:**
```javascript
const calculateRetailPrice = (baseCost, markupPercent = 100) => {
  return (parseFloat(baseCost) * (1 + markupPercent / 100)).toFixed(2);
};

// Example: 100% markup
const baseCost = 11.50;
const retailPrice = calculateRetailPrice(baseCost, 100); // 23.00
```

### API Rate Limits

Printful has rate limits:
- **120 requests per minute**
- **3000 requests per hour**

If you hit limits:
- Implement request queuing
- Cache product catalog locally
- Use bulk operations when available

---

## Best Practices

### 1. Product Pricing

- Always add minimum 50-100% markup to cover costs
- Consider shipping costs in pricing
- Account for Printful fees and taxes
- Test with sample orders first

### 2. Product Images

- Use high-resolution design files (300 DPI)
- Follow Printful's file requirements
- Generate mockups for better visuals
- Show multiple product angles

### 3. Inventory Management

- Printful products have unlimited stock
- Don't sync inventory for POD products
- Set `stock_quantity: 9999` for POD items

### 4. Order Processing

- Validate customer addresses before submitting
- Provide clear shipping time estimates
- Handle order failures gracefully
- Send customers tracking information

### 5. Testing

Test your integration:
```javascript
// Test mode: Don't confirm orders
const { data: estimate } = await createOrder(orderData, false);
console.log('Estimated costs:', estimate.costs);

// Only confirm when ready
const { data: order } = await createOrder(orderData, true);
```

---

## Support Resources

- **Printful API Docs:** https://developers.printful.com/
- **Printful Support:** https://www.printful.com/help
- **3Commerce Issues:** https://github.com/your-repo/issues

---

## Version History

- **v1.0.0** (2025-01-03) - Initial integration
  - Product catalog browser
  - Order fulfillment
  - Webhook handling
  - Settings UI

---

## License

This integration is part of the 3Commerce application.
