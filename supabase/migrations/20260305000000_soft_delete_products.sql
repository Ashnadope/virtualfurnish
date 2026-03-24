-- Add is_archived column to products for soft-delete support.
-- Archived products are hidden from all storefront and admin queries
-- but are retained in the database so order history remains intact.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast filtering of non-archived products
CREATE INDEX IF NOT EXISTS idx_products_is_archived ON public.products(is_archived);
