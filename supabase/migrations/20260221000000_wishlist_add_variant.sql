-- =====================================================
-- ADD VARIANT_ID TO WISHLIST_ITEMS
-- Allows wishlisting a specific product variant
-- (e.g. the black variant, not just the product)
-- =====================================================

-- Add variant_id column (nullable so old rows stay valid)
ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Index for variant lookups
CREATE INDEX IF NOT EXISTS idx_wishlist_items_variant_id
  ON public.wishlist_items(variant_id);

-- Drop old product-level unique constraint and replace with
-- a variant-level one so each user can wishlist each variant once
-- (and can also wishlist multiple variants of the same product)
ALTER TABLE public.wishlist_items
  DROP CONSTRAINT IF EXISTS wishlist_items_user_id_product_id_key;

-- Unique per (user, variant) — variant_id is NOT NULL going forward
-- A partial unique index keeps old NULL rows from conflicting
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_user_variant_unique
  ON public.wishlist_items(user_id, variant_id)
  WHERE variant_id IS NOT NULL;

-- Keep a fallback unique index for legacy rows without a variant
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_user_product_no_variant_unique
  ON public.wishlist_items(user_id, product_id)
  WHERE variant_id IS NULL;
