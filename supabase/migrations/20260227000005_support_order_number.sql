-- Add order_number to support_messages so order-linked inquiries can be
-- displayed cleanly in the admin dashboard without parsing message text.
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS order_number TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_support_messages_order_number
  ON public.support_messages(order_number)
  WHERE order_number IS NOT NULL;
