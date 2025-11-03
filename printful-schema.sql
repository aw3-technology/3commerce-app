-- Printful Integration Database Schema
-- Run this SQL in your Supabase SQL Editor to add Printful integration tables

-- Printful Product Mappings Table
-- Links local products to Printful products
CREATE TABLE IF NOT EXISTS printful_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    -- Printful IDs
    printful_product_id BIGINT NOT NULL, -- Catalog product ID
    printful_variant_id BIGINT, -- Specific variant ID
    printful_sync_product_id BIGINT, -- Sync product ID (created in Printful store)
    printful_sync_variant_id BIGINT, -- Sync variant ID

    -- Pricing
    cost DECIMAL(10, 2), -- Printful cost
    retail_price DECIMAL(10, 2), -- Retail price

    -- Design files and options
    files JSONB, -- Array of design files with placements
    options JSONB, -- Print options (color, size, etc.)
    mockup_urls JSONB, -- Generated mockup image URLs

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Printful Orders Table
-- Tracks orders submitted to Printful
CREATE TABLE IF NOT EXISTS printful_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    -- Printful order details
    printful_order_id VARCHAR(255) UNIQUE, -- Printful order ID or external ID
    printful_internal_id BIGINT, -- Printful internal numeric ID

    -- Status tracking
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending, failed, canceled, inprocess, onhold, partial, fulfilled

    -- Shipping information
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    carrier VARCHAR(100),
    service VARCHAR(100),

    -- Shipments (can have multiple packages)
    shipments JSONB,

    -- Cost breakdown
    costs JSONB, -- subtotal, discount, shipping, digitization, tax, vat, total

    -- Order details
    retail_costs JSONB, -- Retail pricing
    items JSONB, -- Order items with Printful details
    recipient JSONB, -- Shipping address

    -- Timestamps
    estimated_fulfillment TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Printful Webhook Events Table
-- Logs webhook events from Printful
CREATE TABLE IF NOT EXISTS printful_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- package_shipped, package_returned, order_failed, etc.
    printful_order_id VARCHAR(255),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Event payload
    payload JSONB NOT NULL,

    -- Processing status
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend products table with Printful columns
-- Add columns to existing products table for Printful integration
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_printful_product BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS printful_metadata JSONB;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_printful_products_user_id ON printful_products(user_id);
CREATE INDEX IF NOT EXISTS idx_printful_products_product_id ON printful_products(product_id);
CREATE INDEX IF NOT EXISTS idx_printful_products_sync_product_id ON printful_products(printful_sync_product_id);
CREATE INDEX IF NOT EXISTS idx_printful_orders_user_id ON printful_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_printful_orders_order_id ON printful_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_printful_orders_printful_order_id ON printful_orders(printful_order_id);
CREATE INDEX IF NOT EXISTS idx_printful_orders_status ON printful_orders(status);
CREATE INDEX IF NOT EXISTS idx_printful_webhook_events_processed ON printful_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_printful_webhook_events_event_type ON printful_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_products_is_printful ON products(is_printful_product);

-- Enable Row Level Security (RLS)
ALTER TABLE printful_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE printful_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE printful_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Printful Products: Users can only manage their own Printful products
CREATE POLICY "Users can view their own printful products" ON printful_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own printful products" ON printful_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own printful products" ON printful_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own printful products" ON printful_products
    FOR DELETE USING (auth.uid() = user_id);

-- Printful Orders: Users can only view their own orders
CREATE POLICY "Users can view their own printful orders" ON printful_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own printful orders" ON printful_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own printful orders" ON printful_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Printful Webhook Events: Service role only (webhooks processed server-side)
CREATE POLICY "Service role can manage webhook events" ON printful_webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_printful_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_printful_products_updated_at
    BEFORE UPDATE ON printful_products
    FOR EACH ROW
    EXECUTE FUNCTION update_printful_updated_at();

CREATE TRIGGER update_printful_orders_updated_at
    BEFORE UPDATE ON printful_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_printful_updated_at();

-- Comments
COMMENT ON TABLE printful_products IS 'Maps local products to Printful catalog products and sync products';
COMMENT ON TABLE printful_orders IS 'Tracks orders submitted to Printful for fulfillment';
COMMENT ON TABLE printful_webhook_events IS 'Logs webhook events received from Printful API';
COMMENT ON COLUMN products.is_printful_product IS 'Flag indicating if this product is fulfilled by Printful';
COMMENT ON COLUMN products.printful_metadata IS 'Additional Printful-specific metadata for the product';
