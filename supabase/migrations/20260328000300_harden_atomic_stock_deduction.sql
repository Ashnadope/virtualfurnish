-- Harden stock deduction to be truly concurrency-safe.
--
-- Why this patch is needed:
-- The previous function pre-checked then updated, but without row-level locking,
-- two concurrent transactions could both pass the check and both decrement.
--
-- What this version does:
-- 1) Locks all stock rows involved in the order in deterministic order.
-- 2) Re-checks availability while locks are held.
-- 3) Fails loudly on insufficiency before any decrement.
-- 4) Applies all decrements only after checks pass.
--
-- Result: first transaction wins, later overlapping transactions wait, then fail safely.

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
  -- Lock variant rows touched by this order in deterministic order.
  PERFORM 1
  FROM product_variants pv
  JOIN (
    SELECT oi.variant_id, SUM(oi.quantity)::INTEGER AS qty_needed
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NOT NULL
    GROUP BY oi.variant_id
  ) n ON n.variant_id = pv.id
  ORDER BY pv.id
  FOR UPDATE;

  -- Lock product rows (for non-variant order items) in deterministic order.
  PERFORM 1
  FROM products p
  JOIN (
    SELECT oi.product_id, SUM(oi.quantity)::INTEGER AS qty_needed
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.variant_id IS NULL
      AND oi.product_id IS NOT NULL
    GROUP BY oi.product_id
  ) n ON n.product_id = p.id
  ORDER BY p.id
  FOR UPDATE;

  -- Re-check stock while rows are locked.
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

  -- Safe to decrement now: checks were made under lock.
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
