-- Track whether stock was actually committed for an order and allow support
-- notices to deep-link directly to the affected order.

ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_support_messages_order_id
  ON public.support_messages(order_id)
  WHERE order_id IS NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_allocated BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing paid/active orders have already consumed stock in the current flow,
-- so mark them as allocated to keep cancellation stock restoration correct.
UPDATE public.orders
SET stock_allocated = TRUE
WHERE stock_allocated = FALSE
  AND status IN ('processing', 'packing', 'shipped', 'delivered')
  AND payment_status IN ('succeeded', 'paid', 'completed');