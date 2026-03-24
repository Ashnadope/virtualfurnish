-- Extend payment_status on orders to support refund lifecycle.
-- The existing inline CHECK has an auto-generated name; drop it and recreate.
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status = ANY (ARRAY[
    'pending'::text,
    'succeeded'::text,
    'failed'::text,
    'cancelled'::text,
    'refund_pending'::text,
    'refunded'::text
  ]));
