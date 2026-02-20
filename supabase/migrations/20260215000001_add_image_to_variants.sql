-- Rename size column to dimensions for consistency with product dimensions field
-- Add image_url and weight columns to product_variants table for per-variant images and weight
-- RUN THIS MIGRATION BEFORE CREATING NEW PRODUCTS WITH VARIANTS

-- Check if dimensions column already exists, if not rename size
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_variants' AND column_name='dimensions') THEN
        ALTER TABLE product_variants RENAME COLUMN size TO dimensions;
    END IF;
END
$$;

-- Add image_url column for variant-specific images
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add weight column for variant-specific weight
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Add comments for documentation
COMMENT ON COLUMN product_variants.dimensions IS 'Variant-specific dimensions (e.g., Small, Large, 200x90x85 cm)';
COMMENT ON COLUMN product_variants.image_url IS 'Optional image URL for variant-specific product image in admin preview';
COMMENT ON COLUMN product_variants.weight IS 'Variant-specific weight (e.g., in kg or lbs)';
