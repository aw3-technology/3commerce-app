-- Help & Getting Started Database Schema
-- Add these tables to your Supabase database for help functionality

-- FAQ Categories Table
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Items Table
CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES faq_categories(id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Getting Started Resources Table
CREATE TABLE IF NOT EXISTS help_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(100), -- video, article, tutorial, guide
    image_url TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(50), -- beginner, intermediate, advanced
    tags TEXT[], -- Array of tags
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- account, billing, technical, feature-request, other
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'open', -- open, in-progress, resolved, closed
    assigned_to UUID REFERENCES auth.users(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Ticket Replies Table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_staff_reply BOOLEAN DEFAULT FALSE,
    attachments JSONB, -- Array of attachment URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Help Activity Table (track what users have viewed)
CREATE TABLE IF NOT EXISTS user_help_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    resource_type VARCHAR(50), -- faq, help_resource, tutorial
    resource_id UUID,
    action VARCHAR(50), -- viewed, completed, helpful, not_helpful
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_help_resources_category ON help_resources(category);
CREATE INDEX IF NOT EXISTS idx_help_resources_featured ON help_resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket ON support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_user_help_activity_user ON user_help_activity(user_id);

-- Enable Row Level Security
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_help_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- FAQ Categories and Items: Public read access
CREATE POLICY "Anyone can view active FAQ categories" ON faq_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active FAQ items" ON faq_items
    FOR SELECT USING (is_active = true);

-- Help Resources: Public read access
CREATE POLICY "Anyone can view active help resources" ON help_resources
    FOR SELECT USING (is_active = true OR is_active IS NULL);

-- Support Tickets: Users can only see their own tickets
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Support Ticket Replies: Users can view replies to their tickets
CREATE POLICY "Users can view replies to their tickets" ON support_ticket_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can reply to their tickets" ON support_ticket_replies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

-- User Help Activity: Users can only access their own activity
CREATE POLICY "Users can view their own activity" ON user_help_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" ON user_help_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample FAQ categories
INSERT INTO faq_categories (title, description, display_order) VALUES
    ('Get started', 'Basic information to help you get started', 1),
    ('Login & access', 'Help with login and account access issues', 2),
    ('Billing & payments', 'Questions about billing and payment methods', 3),
    ('My benefits', 'Information about your account benefits', 4),
    ('Account settings', 'Manage your account settings and preferences', 5)
ON CONFLICT DO NOTHING;

-- Insert sample FAQ items
DO $$
DECLARE
    cat_get_started UUID;
    cat_login UUID;
    cat_billing UUID;
    cat_benefits UUID;
    cat_settings UUID;
BEGIN
    SELECT id INTO cat_get_started FROM faq_categories WHERE title = 'Get started';
    SELECT id INTO cat_login FROM faq_categories WHERE title = 'Login & access';
    SELECT id INTO cat_billing FROM faq_categories WHERE title = 'Billing & payments';
    SELECT id INTO cat_benefits FROM faq_categories WHERE title = 'My benefits';
    SELECT id INTO cat_settings FROM faq_categories WHERE title = 'Account settings';

    -- Get started FAQs
    INSERT INTO faq_items (category_id, question, answer, display_order) VALUES
        (cat_get_started, 'How to upgrade to Pro account?', 'Enjoy instant access to our vast library of premium products and all upcoming new releases with super-fast download speeds. Navigate to Settings > Subscription and choose your preferred plan.', 1),
        (cat_get_started, 'How do I create my first product?', 'Go to the Products page and click "New Product". Fill in the required information including name, description, price, and upload images. You can save as draft or publish immediately.', 2),
        (cat_get_started, 'What are the system requirements?', 'Our platform works on all modern web browsers including Chrome, Firefox, Safari, and Edge. For best performance, we recommend keeping your browser updated to the latest version.', 3);

    -- Login & Access FAQs
    INSERT INTO faq_items (category_id, question, answer, display_order) VALUES
        (cat_login, 'I forgot my password', 'Click "Forgot Password" on the login page and enter your email address. We''ll send you instructions to reset your password. Check your spam folder if you don''t receive the email within a few minutes.', 1),
        (cat_login, 'I can''t reset my password', 'If you''re having trouble resetting your password, make sure you''re using the same email address you registered with. Contact support if the issue persists.', 2),
        (cat_login, 'How do I change my email address?', 'Go to Settings > Profile Information and update your email address. You''ll need to verify the new email address before it becomes active.', 3);

    -- Billing FAQs
    INSERT INTO faq_items (category_id, question, answer, display_order) VALUES
        (cat_billing, 'What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise accounts.', 1),
        (cat_billing, 'How do I update my billing information?', 'Navigate to Settings > Payment and click "Edit Payment Method" to update your billing information.', 2),
        (cat_billing, 'Can I get a refund?', 'Yes, we offer a 30-day money-back guarantee for all purchases. Contact support with your order details to request a refund.', 3);
END $$;

-- Insert sample help resources
INSERT INTO help_resources (title, description, category, image_url, difficulty_level, is_featured, is_new, display_order) VALUES
    ('Exclusive downloads', 'Access exclusive premium content and downloads available only to pro members', 'tutorial', '/images/content/product-pic-1.jpg', 'beginner', false, true, 1),
    ('Behind the scenes', 'Learn how successful creators build and grow their product business', 'video', '/images/content/product-pic-2.jpg', 'intermediate', false, true, 2),
    ('Use guidelines', 'Best practices and guidelines for using the platform effectively', 'guide', '/images/content/product-pic-3.jpg', 'beginner', false, false, 3),
    ('Life & work update', 'Stay updated with the latest features and platform improvements', 'article', '/images/content/product-pic-4.jpg', 'beginner', false, false, 4),
    ('Promote your product', 'Effective strategies to promote and market your products', 'tutorial', '/images/content/product-pic-5.jpg', 'intermediate', true, false, 5)
ON CONFLICT DO NOTHING;
