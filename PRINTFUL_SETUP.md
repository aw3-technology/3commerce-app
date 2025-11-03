# Printful Integration - Quick Setup Guide

## Prerequisites

- Printful account ([Sign up here](https://www.printful.com))
- Printful API token
- Supabase database access

## Setup Steps

### 1. Database Migration

Run the Printful schema migration in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard → SQL Editor
# Copy and paste the contents of printful-schema.sql
# Click "Run"
```

The schema file is located at: `printful-schema.sql`

### 2. Verify Environment Variable

Your Printful API token has been added to `.env`:

```env
REACT_APP_PRINTFUL_API_TOKEN=lNaAgZKOcE7oL3rw7XGJDOKrrcixSEVdB3Zbuxyx
```

### 3. Restart Development Server

After the .env change, restart your server:

```bash
# Stop the current server (Ctrl+C)
npm start
```

### 4. Test the Connection

1. Navigate to **Settings → Integrations** in your app
2. Click the "Test Connection" button
3. Verify you see "Connected" status
4. Review your Printful store information

### 5. Create Your First Printful Product

1. Go to **New Product**
2. Scroll to **Print-on-Demand (Printful)** section
3. Check "Enable Printful fulfillment"
4. Click "Browse Printful Products"
5. Select a product (e.g., "Unisex Staple T-Shirt")
6. Choose variants (colors/sizes)
7. Set your retail price
8. Click "Publish"

## What Was Integrated

### ✅ Features Implemented

1. **Printful Service Layer**
   - API client with authentication
   - Product catalog browsing
   - Order fulfillment
   - Webhook handling

2. **UI Components**
   - Settings integration page
   - Product catalog browser
   - Printful product selector in New Product workflow

3. **Database Schema**
   - `printful_products` table
   - `printful_orders` table
   - `printful_webhook_events` table
   - Extended `products` table

4. **Order Fulfillment**
   - Automatic order submission to Printful
   - Status tracking
   - Webhook event processing

### 📁 Files Created

```
src/
├── services/
│   ├── printfulClient.js           # API client
│   ├── printfulService.js          # Product & order operations
│   └── printfulOrderService.js     # Fulfillment logic
│
├── components/
│   └── PrintfulBrowser/            # Product catalog browser
│       ├── index.js
│       └── PrintfulBrowser.module.sass
│
└── screens/
    ├── Settings/Printful/          # Integration settings
    │   ├── index.js
    │   └── Printful.module.sass
    │
    └── NewProduct/PrintfulProduct/ # Product creation
        ├── index.js
        └── PrintfulProduct.module.sass

Database:
├── printful-schema.sql             # Database migration

Documentation:
├── PRINTFUL_INTEGRATION.md         # Full documentation
└── PRINTFUL_SETUP.md              # This file
```

## Usage Flow

### Creating a Printful Product

```
New Product Page
    ↓
Enable Printful Fulfillment (checkbox)
    ↓
Browse Products (modal opens)
    ↓
Select Product & Variants
    ↓
Set Retail Price
    ↓
Publish Product
```

### Order Fulfillment (Automatic)

```
Customer Places Order
    ↓
Order Sent to Printful API
    ↓
Printful Processes Order
    ↓
Printful Ships Product
    ↓
Webhook Updates Status
    ↓
Customer Gets Tracking Info
```

## Verification Checklist

- [ ] Database tables created successfully
- [ ] Settings page shows "Connected" status
- [ ] Can browse Printful products
- [ ] Can select product variants
- [ ] Can create and publish Printful product
- [ ] Product shows in Released products list

## Next Steps

1. **Review Documentation**
   - Read `PRINTFUL_INTEGRATION.md` for complete API reference
   - Understand the order fulfillment flow

2. **Configure Webhooks** (Optional but recommended)
   - Set up webhook endpoint in your server
   - Configure webhook URL in Printful dashboard
   - Test webhook events

3. **Test Order Flow**
   - Create a test product
   - Place a test order
   - Monitor order status updates

4. **Production Considerations**
   - Secure API token storage
   - Implement error handling
   - Set up monitoring
   - Configure proper pricing with markup

## Troubleshooting

### SASS Compilation Errors

If you see "Undefined variable" errors:
- The SASS files have been updated to use correct variable names (`$n`, `$n1`, `$n2`, etc.)
- Restart your development server

### Connection Failed

1. Verify API token in `.env`
2. Check Printful dashboard for API access
3. Restart server after changing `.env`

### Products Not Loading

1. Open browser console
2. Check for API errors
3. Verify network requests in DevTools
4. Ensure API token has proper permissions

## Support

For detailed information, see:
- **Full Documentation:** `PRINTFUL_INTEGRATION.md`
- **Printful API Docs:** https://developers.printful.com/
- **Printful Help Center:** https://www.printful.com/help

---

**Integration completed successfully!** 🎉

Your 3Commerce app is now ready to create and fulfill print-on-demand products with Printful.
