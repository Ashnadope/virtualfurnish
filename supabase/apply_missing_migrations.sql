-- =====================================================================
-- COMBINED MIGRATION: Apply all missing schema changes to production
-- Run this in the Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- ─── 1. QRPH payment method support (20260405) ─────────────────────
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'gcash', 'qrph'));

ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_gateway_check;

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_gateway_check
  CHECK (gateway IN ('stripe', 'gcash', 'paymongo'));

ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS paymongo_payment_intent_id TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paymongo_payment_intent_id TEXT;

-- ─── 2. Stock allocation tracking (20260328000200) ──────────────────
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_support_messages_order_id
  ON public.support_messages(order_id)
  WHERE order_id IS NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_allocated BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark existing paid orders as stock-allocated
UPDATE public.orders
SET stock_allocated = TRUE
WHERE stock_allocated = FALSE
  AND status IN ('processing', 'packing', 'shipped', 'delivered')
  AND payment_status IN ('succeeded', 'paid', 'completed');

-- ─── 3. Atomic stock deduction function (20260328000300) ────────────
-- NOTE: FOR UPDATE cannot be used with GROUP BY in PostgreSQL,
-- so we lock rows first (no aggregation), then check + decrement.
CREATE OR REPLACE FUNCTION public.deduct_order_stock_atomic(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_insufficient_variant UUID;
  v_insufficient_product UUID;
BEGIN
  -- 1) Lock variant rows touched by this order in deterministic order.
  PERFORM 1
  FROM product_variants pv
  WHERE pv.id IN (
    SELECT oi.variant_id
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NOT NULL
  )
  ORDER BY pv.id
  FOR UPDATE;

  -- 2) Lock product rows (for non-variant items) in deterministic order.
  PERFORM 1
  FROM products p
  WHERE p.id IN (
    SELECT oi.product_id
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NULL
      AND oi.product_id IS NOT NULL
  )
  ORDER BY p.id
  FOR UPDATE;

  -- 3) Re-check variant stock while rows are locked.
  SELECT n.variant_id
  INTO v_insufficient_variant
  FROM (
    SELECT oi.variant_id, SUM(oi.quantity)::INTEGER AS qty_needed
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NOT NULL
    GROUP BY oi.variant_id
  ) n
  JOIN product_variants pv ON pv.id = n.variant_id
  WHERE pv.stock_quantity < n.qty_needed
  LIMIT 1;

  IF v_insufficient_variant IS NOT NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: variant %', v_insufficient_variant;
  END IF;

  -- 4) Re-check product stock while rows are locked.
  SELECT n.product_id
  INTO v_insufficient_product
  FROM (
    SELECT oi.product_id, SUM(oi.quantity)::INTEGER AS qty_needed
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NULL
      AND oi.product_id IS NOT NULL
    GROUP BY oi.product_id
  ) n
  JOIN products p ON p.id = n.product_id
  WHERE p.stock_quantity < n.qty_needed
  LIMIT 1;

  IF v_insufficient_product IS NOT NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: product %', v_insufficient_product;
  END IF;

  -- 5) Decrement variant stock.
  UPDATE product_variants pv
  SET stock_quantity = pv.stock_quantity - n.qty_needed
  FROM (
    SELECT oi.variant_id, SUM(oi.quantity)::INTEGER AS qty_needed
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NOT NULL
    GROUP BY oi.variant_id
  ) n
  WHERE pv.id = n.variant_id;

  -- 6) Decrement product stock (non-variant items).
  UPDATE products p
  SET stock_quantity = p.stock_quantity - n.qty_needed
  FROM (
    SELECT oi.product_id, SUM(oi.quantity)::INTEGER AS qty_needed
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NULL
      AND oi.product_id IS NOT NULL
    GROUP BY oi.product_id
  ) n
  WHERE p.id = n.product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_order_stock_atomic(UUID) TO authenticated, service_role;

-- ─── 4. J&T waybill column (20260410) ──────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS jt_waybill text;

CREATE INDEX IF NOT EXISTS idx_orders_jt_waybill
  ON public.orders (jt_waybill)
  WHERE jt_waybill IS NOT NULL;

-- ─── 5. Barangay column (20260411) ─────────────────────────────────
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS barangay text;

-- ─── Done ──────────────────────────────────────────────────────────
-- After running this, deploy the edge functions:
--   npx supabase functions deploy process-gcash-payment --no-verify-jwt
--   npx supabase functions deploy check-qrph-status --no-verify-jwt
