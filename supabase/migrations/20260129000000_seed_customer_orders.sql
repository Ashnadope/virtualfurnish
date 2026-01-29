-- =====================================================
-- VIRTUALFURNISH CUSTOMER ORDERS SEED DATA
-- Seed real order data for customer@virtualfurnish.com
-- Generated: 2026-01-29
-- =====================================================

DO $$
DECLARE
    customer_id UUID;
    order_id_1 UUID := '550e8400-e29b-41d4-a716-446655440101'::UUID;
    order_id_2 UUID := '550e8400-e29b-41d4-a716-446655440102'::UUID;
    order_id_3 UUID := '550e8400-e29b-41d4-a716-446655440103'::UUID;
BEGIN
    -- Get the customer ID for customer@virtualfurnish.com
    SELECT id INTO customer_id FROM user_profiles WHERE email = 'customer@virtualfurnish.com' LIMIT 1;
    
    IF customer_id IS NULL THEN
        RAISE NOTICE '⚠️ Customer email not found: customer@virtualfurnish.com';
        RETURN;
    END IF;
    
    -- ===== ORDER 1: Modern Leather Sofa =====
    INSERT INTO orders (
        id, user_id, order_number, status, payment_status, payment_method, 
        payment_intent_id, subtotal, tax_amount, shipping_amount, discount_amount, 
        total_amount, currency, shipping_address, billing_address, notes, created_at, updated_at
    ) VALUES (
        order_id_1, customer_id, 'ORD-2025-1234', 'shipped', 'succeeded', 'card',
        'pi_1Abc123456789', 35999.00, 2880.00, 500.00, 0.00,
        39379.00, 'PHP',
        '{"firstName":"Maria","lastName":"Santos","addressLine1":"123 Main Street","city":"Manila","state":"NCR","postalCode":"1000","country":"PH","phone":"+63 917 123 4567"}'::JSONB,
        '{"firstName":"Maria","lastName":"Santos","addressLine1":"123 Main Street","city":"Manila","state":"NCR","postalCode":"1000","country":"PH","phone":"+63 917 123 4567"}'::JSONB,
        NULL, '2025-12-02 10:30:00+00', '2025-12-05 14:45:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 1: Order Items
    INSERT INTO order_items (
        id, order_id, product_id, variant_id, variant_name, sku, name, brand, price, quantity, total, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440201'::UUID, order_id_1, NULL, NULL, 'Black Leather', 'SOFA-ML-001-BLK', 
        'Modern Leather Sofa - Black', 'Urban Living', 45999.00, 1, 45999.00, '2025-12-02 10:30:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 1: Payment Transaction
    INSERT INTO payment_transactions (
        id, order_id, payment_intent_id, stripe_charge_id, gcash_reference_id, amount, currency, status, transaction_type, gateway, gateway_transaction_id, metadata, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440401'::UUID, order_id_1, 'pi_1Abc123456789', 'ch_1Abc123456789', NULL, 39379.00, 'PHP', 'succeeded', 'payment', 'stripe', 'ch_1Abc123456789', '{"orderId":"ORD-2025-1234"}'::JSONB, '2025-12-02 10:30:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- ===== ORDER 2: Wooden Bookshelf =====
    INSERT INTO orders (
        id, user_id, order_number, status, payment_status, payment_method, 
        payment_intent_id, subtotal, tax_amount, shipping_amount, discount_amount, 
        total_amount, currency, shipping_address, billing_address, notes, created_at, updated_at
    ) VALUES (
        order_id_2, customer_id, 'ORD-2025-1189', 'delivered', 'succeeded', 'card',
        'pi_2Xyz789012345', 6499.00, 520.00, 200.00, 0.00,
        7219.00, 'PHP',
        '{"firstName":"Maria","lastName":"Santos","addressLine1":"123 Main Street","city":"Manila","state":"NCR","postalCode":"1000","country":"PH","phone":"+63 917 123 4567"}'::JSONB,
        '{"firstName":"Maria","lastName":"Santos","addressLine1":"123 Main Street","city":"Manila","state":"NCR","postalCode":"1000","country":"PH","phone":"+63 917 123 4567"}'::JSONB,
        NULL, '2025-11-28 09:15:00+00', '2025-12-04 16:20:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 2: Order Items
    INSERT INTO order_items (
        id, order_id, product_id, variant_id, variant_name, sku, name, brand, price, quantity, total, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440202'::UUID, order_id_2, NULL, NULL, NULL, 'SHELF-BU-001',
        'Wooden Bookshelf', 'Library Style', 6499.00, 1, 6499.00, '2025-11-28 09:15:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 2: Payment Transaction
    INSERT INTO payment_transactions (
        id, order_id, payment_intent_id, stripe_charge_id, gcash_reference_id, amount, currency, status, transaction_type, gateway, gateway_transaction_id, metadata, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440402'::UUID, order_id_2, 'pi_2Xyz789012345', 'ch_2Xyz789012345', NULL, 7219.00, 'PHP', 'succeeded', 'payment', 'stripe', 'ch_2Xyz789012345', '{"orderId":"ORD-2025-1189"}'::JSONB, '2025-11-28 09:15:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- ===== ORDER 3: Office Desk with Drawers =====
    INSERT INTO orders (
        id, user_id, order_number, status, payment_status, payment_method, 
        payment_intent_id, subtotal, tax_amount, shipping_amount, discount_amount, 
        total_amount, currency, shipping_address, billing_address, notes, created_at, updated_at
    ) VALUES (
        order_id_3, customer_id, 'ORD-2025-1156', 'processing', 'succeeded', 'card',
        'pi_3Def456789012', 12999.00, 1040.00, 300.00, 0.00,
        14339.00, 'PHP',
        '{"firstName":"Maria","lastName":"Santos","addressLine1":"123 Main Street","city":"Manila","state":"NCR","postalCode":"1000","country":"PH","phone":"+63 917 123 4567"}'::JSONB,
        '{"firstName":"Maria","lastName":"Santos","addressLine1":"123 Main Street","city":"Manila","state":"NCR","postalCode":"1000","country":"PH","phone":"+63 917 123 4567"}'::JSONB,
        NULL, '2025-12-05 11:45:00+00', '2025-12-06 08:30:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 3: Order Items
    INSERT INTO order_items (
        id, order_id, product_id, variant_id, variant_name, sku, name, brand, price, quantity, total, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440203'::UUID, order_id_3, NULL, NULL, NULL, 'DESK-EO-001',
        'Office Desk with Drawers', 'WorkSpace Pro', 12999.00, 1, 12999.00, '2025-12-05 11:45:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Order 3: Payment Transaction
    INSERT INTO payment_transactions (
        id, order_id, payment_intent_id, stripe_charge_id, gcash_reference_id, amount, currency, status, transaction_type, gateway, gateway_transaction_id, metadata, created_at
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440403'::UUID, order_id_3, 'pi_3Def456789012', 'ch_3Def456789012', NULL, 14339.00, 'PHP', 'succeeded', 'payment', 'stripe', 'ch_3Def456789012', '{"orderId":"ORD-2025-1156"}'::JSONB, '2025-12-05 11:45:00+00'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- ===== UPDATE USER PROFILE STATS =====
    UPDATE user_profiles
    SET 
        total_orders = 3,
        total_spent = '102997.00'::DECIMAL,
        loyalty_points = 2054,
        updated_at = NOW()
    WHERE id = customer_id;
    
END $$;

DO $$
BEGIN
    RAISE NOTICE '✅ Customer Orders Seed Data Migration Completed Successfully';
    RAISE NOTICE '📦 Inserted 3 orders with order items and payment transactions';
    RAISE NOTICE '💳 Total spent by customer: PHP 102,997.00';
    RAISE NOTICE '🎁 Loyalty points awarded: 2054';
END $$;
