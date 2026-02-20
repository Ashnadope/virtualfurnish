-- =====================================================
-- MIGRATION: Variant active state, material, cascade trigger & data cleanup
-- Date: 2026-02-20
-- Combines:
--   1. Add material + is_active columns to product_variants
--   2. Cascade trigger: product.is_active → variant.is_active
--   3. Delete test/junk products
--   4. Auto-create a default variant for any orphan products (no variants yet)
-- =====================================================

-- -------------------------------------------------------
-- 1. Add material column to product_variants (if not exists)
--    image_url, dimensions, weight already added in 20260215000001
-- -------------------------------------------------------
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS material TEXT;

-- -------------------------------------------------------
-- 2. Add is_active column to product_variants
-- -------------------------------------------------------
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- -------------------------------------------------------
-- 3. Sync existing variants with their parent product's is_active status
--    so we start from a consistent state
-- -------------------------------------------------------
UPDATE product_variants pv
SET is_active = p.is_active
FROM products p
WHERE pv.product_id = p.id;

-- -------------------------------------------------------
-- 4. Cascade function: when a product's is_active changes,
--    automatically update all its variants
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION cascade_product_active_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    UPDATE product_variants
    SET is_active = NEW.is_active
    WHERE product_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- 5. Attach the trigger to products table
-- -------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_cascade_product_active ON products;
CREATE TRIGGER trigger_cascade_product_active
  AFTER UPDATE OF is_active ON products
  FOR EACH ROW
  EXECUTE FUNCTION cascade_product_active_status();

-- -------------------------------------------------------
-- 6. Delete test/junk products (variants cascade via ON DELETE CASCADE)
-- -------------------------------------------------------
DELETE FROM products
WHERE name ILIKE 'hah'
   OR (name ILIKE 'test%' AND created_at > NOW() - INTERVAL '30 days');

-- -------------------------------------------------------
-- 7. For any products that have NO variants at all,
--    create a single default variant using the product's own data
--    so they appear correctly in the catalog
-- -------------------------------------------------------
INSERT INTO product_variants (
  product_id,
  name,
  color,
  price,
  stock_quantity,
  material,
  dimensions,
  weight,
  is_active
)
SELECT
  p.id,
  p.name,
  COALESCE(p.color, 'Default'),
  p.base_price,
  COALESCE(p.stock_quantity, 0),
  p.material,
  p.dimensions,
  p.weight,
  p.is_active
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
);

-- -------------------------------------------------------
-- 8. Comments for documentation
-- -------------------------------------------------------
COMMENT ON COLUMN product_variants.is_active IS
  'Whether this variant is visible/available. Cascades automatically from parent product.is_active.';

COMMENT ON COLUMN product_variants.material IS
  'Variant-specific material (e.g. Solid Wood, Velvet Fabric). Overrides the product-level material.';

COMMENT ON COLUMN product_variants.image_url IS
  'Variant-specific image. This is the authoritative image source for the catalog and room designer.';
