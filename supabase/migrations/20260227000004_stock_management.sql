-- Atomic stock adjustment helpers.
-- p_delta is NEGATIVE to decrement (payment confirmed),
--          POSITIVE to restore  (order cancelled).
-- GREATEST(0, ...) prevents stock going below zero on decrement.
-- SECURITY DEFINER executes as the function owner (bypasses RLS),
-- so authenticated users and service-role callers can both use these.

CREATE OR REPLACE FUNCTION public.adjust_variant_stock(p_variant_id UUID, p_delta INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = GREATEST(0, stock_quantity + p_delta)
  WHERE id = p_variant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product_id UUID, p_delta INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity + p_delta)
  WHERE id = p_product_id;
END;
$$;

-- authenticated  → cancel route (Next.js API route, user JWT session)
-- service_role   → Stripe/GCash webhook edge functions (JWT verification disabled;
--                  client is created with the service-role API key directly)
GRANT EXECUTE ON FUNCTION public.adjust_variant_stock(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(UUID, INTEGER) TO authenticated, service_role;
