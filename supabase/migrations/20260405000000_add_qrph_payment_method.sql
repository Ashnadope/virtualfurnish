-- =====================================================
-- Add QRPH (PayMongo) payment method support
-- =====================================================

-- 1. Expand orders.payment_method to include 'qrph'
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'gcash', 'qrph'));

-- 2. Expand payment_transactions.gateway to include 'paymongo'
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_gateway_check;

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_gateway_check
  CHECK (gateway IN ('stripe', 'gcash', 'paymongo'));

-- 3. Add a column to store the PayMongo payment intent id on payment_transactions
--    (reuses existing payment_intent_id for Stripe; this dedicated column avoids conflicts)
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS paymongo_payment_intent_id TEXT;

-- 4. Add paymongo_payment_intent_id to orders for quick lookup
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paymongo_payment_intent_id TEXT;
