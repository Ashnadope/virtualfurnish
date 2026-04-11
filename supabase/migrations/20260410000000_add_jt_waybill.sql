-- Add J&T Express waybill/tracking number to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS jt_waybill text;

-- Index for webhook lookups by waybill
CREATE INDEX IF NOT EXISTS idx_orders_jt_waybill
  ON public.orders (jt_waybill)
  WHERE jt_waybill IS NOT NULL;

-- Add QRPH to payment_method constraint if not already present
-- (orders schema originally only had card/gcash)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = ANY (ARRAY['card'::text, 'gcash'::text, 'qrph'::text]));
