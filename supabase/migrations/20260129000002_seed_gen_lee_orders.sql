-- =====================================================
-- VIRTUALFURNISH CUSTOMER ORDERS SEED DATA
-- Seed order data for customer2@virtualfurnish.com (Gen Lee)
-- Generated: 2026-01-29
-- =====================================================

DO $$
DECLARE
    customer_id UUID;
    order_id_1 UUID := '550e8400-e29b-41d4-a716-446655440401'::UUID;
    order_id_2 UUID := '550e8400-e29b-41d4-a716-446655440402'::UUID;
    product_sofa_id UUID;
    product_dining_id UUID;
    product_desk_id UUID;
    variant_sofa_id UUID;
    variant_dining_id UUID;
    variant_desk_id UUID;
BEGIN
    -- Get the customer ID for customer2@virtualfurnish.com
    SELECT id INTO customer_id FROM user_profiles WHERE email = 'customer2@virtualfurnish.com' LIMIT 1;
    
    IF customer_id IS NULL THEN
        RAISE NOTICE '⚠️ Customer email not found: customer2@virtualfurnish.com';
        RETURN;
    END IF;

    -- Get product and variant IDs from existing seeded products
    SELECT id INTO product_sofa_id FROM products WHERE sku = 'SOF-001' LIMIT 1;
    SELECT id INTO product_dining_id FROM products WHERE sku = 'TBL-003' LIMIT 1;
    SELECT id INTO product_desk_id FROM products WHERE sku = 'DSK-006' LIMIT 1;
    
    SELECT id INTO variant_sofa_id FROM product_variants WHERE sku = 'SOF-001-GRY' LIMIT 1;
    SELECT id INTO variant_dining_id FROM product_variants WHERE sku = 'TBL-003-OAK' LIMIT 1;
    SELECT id INTO variant_desk_id FROM product_variants WHERE sku = 'DSK-006' LIMIT 1;
    
    -- ===== ORDER 1: Modern L-Shape Sofa + Standing Desk =====
    INSERT INTO orders (
        id, user_id, order_number, status, payment_status, payment_method, 
        payment_intent_id, subtotal, tax_amount, shipping_amount, discount_amount, 
        total_amount, currency, shipping_address, billing_address, notes, created_at, updated_at
    ) VALUES (
        order_id_1, customer_id, 'ORD-2025-2001', 'delivered', 'succeeded', 'card',
        'pi_4Ghi901234567', 37499.00, 2999.92, 500.00, 0.00,
        40998.92, 'PHP',
        '{"firstName":"Gen","lastName":"Lee","addressLine1":"456 Oak Avenue","city":"Cebu","state":"Cebu","postalCode":"6000","country":"PH","phone":"+63 917 987 6543"}'::JSONB,
        '{"firstName":"Gen","lastName":"Lee","addressLine1":"456 Oak Avenue","city":"Cebu","state":"Cebu","postalCode":"6000","country":"PH","phone":"+63 917 987 6543"}'::JSONB,
        NULL, '2025-12-10 14:20:00+00', '2025-12-18 10:15:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 1: Order Items
    INSERT INTO order_items (
        id, order_id, product_id, variant_id, variant_name, sku, name, brand, price, quantity, total, created_at
    ) VALUES
        ('550e8400-e29b-41d4-a716-446655440501'::UUID, order_id_1, product_sofa_id, variant_sofa_id, 'Gray Fabric', 'SOF-001-GRY', 
        'Modern L-Shape Sofa', 'Urban Living', 24999.00, 1, 24999.00, '2025-12-10 14:20:00+00'),
        ('550e8400-e29b-41d4-a716-446655440502'::UUID, order_id_1, product_desk_id, variant_desk_id, 'Electric Adjustable', 'DSK-006', 
        'Standing Computer Desk', 'WorkSpace Pro', 12500.00, 1, 12500.00, '2025-12-10 14:20:00+00')
    ON CONFLICT (id) DO NOTHING;
    
    -- Order 1: Payment Transaction
    INSERT INTO payment_transactions (
        id, order_id, payment_intent_id, stripe_charge_id, gcash_reference_id, amount, currency, status, transaction_type, gateway, gateway_transaction_id, metadata, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440601'::UUID, order_id_1, 'pi_4Ghi901234567', 'ch_4Ghi901234567', NULL, 40998.92, 'PHP', 'succeeded', 'payment', 'stripe', 'ch_4Ghi901234567', '{"orderId":"ORD-2025-2001"}'::JSONB, '2025-12-10 14:20:00+00'
    ) ON CONFLICT (id) DO NOTHING;

    -- ===== ORDER 2: Dining Table =====
    INSERT INTO orders (
        id, user_id, order_number, status, payment_status, payment_method, 
        payment_intent_id, subtotal, tax_amount, shipping_amount, discount_amount, 
        total_amount, currency, shipping_address, billing_address, notes, created_at, updated_at
    ) VALUES (
        order_id_2, customer_id, 'ORD-2025-2002', 'processing', 'succeeded', 'card',
        'pi_5Jkl345678901', 18500.00, 1480.00, 800.00, 1000.00,
        19780.00, 'PHP',
        '{"firstName":"Gen","lastName":"Lee","addressLine1":"456 Oak Avenue","city":"Cebu","state":"Cebu","postalCode":"6000","country":"PH","phone":"+63 917 987 6543"}'::JSONB,
        '{"firstName":"Gen","lastName":"Lee","addressLine1":"456 Oak Avenue","city":"Cebu","state":"Cebu","postalCode":"6000","country":"PH","phone":"+63 917 987 6543"}'::JSONB,
        'Applied 5% loyalty discount', '2025-12-20 09:30:00+00', '2025-12-21 15:45:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 2: Order Items
    INSERT INTO order_items (
        id, order_id, product_id, variant_id, variant_name, sku, name, brand, price, quantity, total, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440503'::UUID, order_id_2, product_dining_id, variant_dining_id, 'Natural Oak', 'TBL-003-OAK',
        'Solid Wood Dining Table', 'Nordic Home', 18500.00, 1, 18500.00, '2025-12-20 09:30:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 2: Payment Transaction
    INSERT INTO payment_transactions (
        id, order_id, payment_intent_id, stripe_charge_id, gcash_reference_id, amount, currency, status, transaction_type, gateway, gateway_transaction_id, metadata, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440602'::UUID, order_id_2, 'pi_5Jkl345678901', 'ch_5Jkl345678901', NULL, 19780.00, 'PHP', 'succeeded', 'payment', 'stripe', 'ch_5Jkl345678901', '{"orderId":"ORD-2025-2002"}'::JSONB, '2025-12-20 09:30:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- ===== UPDATE USER PROFILE STATS =====
    UPDATE user_profiles
    SET 
        total_orders = 2,
        total_spent = '60778.92'::DECIMAL,
        loyalty_points = 1215,
        updated_at = NOW()
    WHERE id = customer_id;
    
END $$;

DO $$
BEGIN
    RAISE NOTICE '✅ Gen Lee Orders Seed Data Migration Completed Successfully';
    RAISE NOTICE '📦 Inserted 2 orders with order items and payment transactions';
    RAISE NOTICE '💳 Total spent by customer: PHP 60,778.92';
    RAISE NOTICE '🎁 Loyalty points awarded: 1215';
END $$;
