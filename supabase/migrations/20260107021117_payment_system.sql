-- =====================================================
-- VIRTUALFURNISH PAYMENT SYSTEM MIGRATION
-- Supports: Stripe (Card) + GCash Payments
-- Generated: 2026-01-07 02:11:17
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- Extends Supabase auth.users with payment information
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    stripe_customer_id TEXT UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADDRESSES TABLE
-- Billing and shipping addresses for orders
-- =====================================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('shipping', 'billing')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'PH',
    phone TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- Furniture products catalog
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    category TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    sku TEXT UNIQUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT VARIANTS TABLE
-- Size, color, material variants
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    size TEXT,
    color TEXT,
    material TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SHOPPING CART TABLE
-- Temporary cart before checkout
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- =====================================================
-- ORDERS TABLE
-- Main orders table tracking payment and fulfillment
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'disputed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('card', 'gcash')),
    payment_intent_id TEXT UNIQUE,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'PHP',
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- Individual items within an order
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    variant_name TEXT,
    sku TEXT,
    name TEXT NOT NULL,
    brand TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT TRANSACTIONS TABLE
-- Track all payment events (payment, refund, dispute)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_intent_id TEXT,
    stripe_charge_id TEXT,
    gcash_reference_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'PHP',
    status TEXT NOT NULL,
    transaction_type TEXT DEFAULT 'payment' CHECK (transaction_type IN ('payment', 'refund', 'dispute')),
    gateway TEXT DEFAULT 'stripe' CHECK (gateway IN ('stripe', 'gcash')),
    gateway_transaction_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT METHODS TABLE
-- Saved payment methods for returning customers
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE,
    type TEXT NOT NULL,
    card_brand TEXT,
    card_last_four TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Addresses Policies
CREATE POLICY "Users can manage own addresses"
    ON addresses FOR ALL
    USING (auth.uid() = user_id);

-- Cart Items Policies
CREATE POLICY "Users can manage own cart"
    ON cart_items FOR ALL
    USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Order Items Policies
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Payment Transactions Policies
CREATE POLICY "Users can view own transactions"
    ON payment_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = payment_transactions.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Payment Methods Policies
CREATE POLICY "Users can manage own payment methods"
    ON payment_methods FOR ALL
    USING (auth.uid() = user_id);

-- Products are public (no RLS needed)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = true);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product variants"
    ON product_variants FOR SELECT
    USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_payment_intent_id ON payment_transactions(payment_intent_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE FURNITURE PRODUCTS DATA
-- =====================================================

INSERT INTO products (name, description, brand, category, base_price, sku, image_url) VALUES
('Modern Leather Sofa', 'Luxurious 3-seater leather sofa with chrome legs', 'Urban Living', 'Sofas', 45999.00, 'SOFA-ML-001', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'),
('Scandinavian Dining Table', 'Oak wood dining table seats 6-8 people', 'Nordic Home', 'Dining', 32999.00, 'TABLE-SD-001', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'),
('Queen Size Bed Frame', 'Modern platform bed with upholstered headboard', 'Dream Rest', 'Beds', 28999.00, 'BED-QS-001', 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800'),
('Executive Office Desk', 'L-shaped desk with built-in storage', 'WorkSpace Pro', 'Office', 24999.00, 'DESK-EO-001', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'),
('Recliner Armchair', 'Comfortable reclining chair with footrest', 'Comfort Zone', 'Chairs', 18999.00, 'CHAIR-RA-001', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'),
('Bookshelf Unit', '5-tier open bookshelf in walnut finish', 'Library Style', 'Storage', 12999.00, 'SHELF-BU-001', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800'),
('Coffee Table', 'Glass top coffee table with metal frame', 'Modern Living', 'Tables', 8999.00, 'TABLE-CT-001', 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800'),
('Wardrobe Cabinet', '3-door wardrobe with mirror and drawers', 'Closet King', 'Storage', 35999.00, 'WARDROBE-001', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800');

-- Add variants for some products
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, size) VALUES
((SELECT id FROM products WHERE sku = 'SOFA-ML-001'), 'Black Leather', 'SOFA-ML-001-BLK', 45999.00, 5, 'Black', '220cm'),
((SELECT id FROM products WHERE sku = 'SOFA-ML-001'), 'Brown Leather', 'SOFA-ML-001-BRN', 47999.00, 3, 'Brown', '220cm'),
((SELECT id FROM products WHERE sku = 'TABLE-SD-001'), 'Natural Oak', 'TABLE-SD-001-NAT', 32999.00, 8, 'Natural', '180cm'),
((SELECT id FROM products WHERE sku = 'BED-QS-001'), 'Grey Upholstered', 'BED-QS-001-GRY', 28999.00, 4, 'Grey', 'Queen'),
((SELECT id FROM products WHERE sku = 'BED-QS-001'), 'Beige Upholstered', 'BED-QS-001-BGE', 28999.00, 6, 'Beige', 'Queen');

DO $$
BEGIN
    RAISE NOTICE '✅ VirtualFurnish Payment System Migration Completed Successfully';
    RAISE NOTICE '📦 Created 11 tables with RLS policies';
    RAISE NOTICE '🛋️ Inserted 8 sample furniture products';
    RAISE NOTICE '🎨 Added 5 product variants';
    RAISE NOTICE '💳 Ready for Stripe + GCash integration';
END $$;