-- Add display_images column for multiple switchable images per variant
-- Used in the virtual room designer to let users toggle between different views
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS display_images TEXT[] DEFAULT '{}';

COMMENT ON COLUMN product_variants.display_images IS 'Array of image URLs for alternate display views in the virtual room designer';
