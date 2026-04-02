-- Enforce stock limits in cart and make stock decrements fail loudly on insufficiency.
-- This prevents users from adding beyond available stock and prevents silent oversell
-- during concurrent payment confirmation.

CREATE OR REPLACE FUNCTION public.adjust_variant_stock(p_variant_id UUID, p_delta INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_delta < 0 THEN
    UPDATE product_variants
    SET stock_quantity = stock_quantity + p_delta
    WHERE id = p_variant_id
      AND stock_quantity + p_delta >= 0;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: variant %', p_variant_id;
    END IF;
  ELSE
    UPDATE product_variants
    SET stock_quantity = stock_quantity + p_delta
    WHERE id = p_variant_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product_id UUID, p_delta INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_delta < 0 THEN
    UPDATE products
    SET stock_quantity = stock_quantity + p_delta
    WHERE id = p_product_id
      AND stock_quantity + p_delta >= 0;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: product %', p_product_id;
    END IF;
  ELSE
    UPDATE products
    SET stock_quantity = stock_quantity + p_delta
    WHERE id = p_product_id;
  END IF;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.validate_cart_item_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INTEGER;
  v_existing_total INTEGER;
BEGIN
  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Cart quantity must be at least 1';
  END IF;

  IF NEW.variant_id IS NOT NULL THEN
    SELECT stock_quantity INTO v_available
    FROM product_variants
    WHERE id = NEW.variant_id;
  ELSE
    SELECT stock_quantity INTO v_available
    FROM products
    WHERE id = NEW.product_id;
  END IF;

  IF v_available IS NULL THEN
    RAISE EXCEPTION 'Stock source not found for cart item';
  END IF;

  SELECT COALESCE(SUM(quantity), 0)
  INTO v_existing_total
  FROM cart_items
  WHERE user_id = NEW.user_id
    AND product_id = NEW.product_id
    AND (
      (variant_id IS NULL AND NEW.variant_id IS NULL)
      OR variant_id = NEW.variant_id
    )
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF (v_existing_total + NEW.quantity) > v_available THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: requested %, available %', (v_existing_total + NEW.quantity), v_available;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_cart_item_stock ON public.cart_items;
CREATE TRIGGER trg_validate_cart_item_stock
BEFORE INSERT OR UPDATE OF user_id, product_id, variant_id, quantity
ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_cart_item_stock();

-- Reference note: the trigger function is SECURITY DEFINER and the supporting
-- cart_items composite index is kept here intentionally, even if those fixes
-- were also applied manually in the dashboard after this migration first ran.
GRANT EXECUTE ON FUNCTION public.adjust_variant_stock(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_order_stock_atomic(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_cart_item_stock() TO authenticated, service_role;

-- Index to speed up the trigger's per-row stock aggregate query.
-- Without this the trigger does a sequential scan on cart_items for every insert/update.
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product_variant
  ON public.cart_items (user_id, product_id, variant_id);
