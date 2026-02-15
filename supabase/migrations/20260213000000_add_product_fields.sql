-- =====================================================
-- ADD MISSING PRODUCT FIELDS
-- Adding fields to match the product management form
-- =====================================================

-- Add dimensions column (e.g., "200 x 90 x 85 cm")
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions TEXT;

-- Add weight column (e.g., "45")
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;

-- Add image alt text for accessibility
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- Add material column (moving from variants to base product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;

-- Add color column (moving from variants to base product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;

-- Add stock quantity to products table (for simple products without variants)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- =====================================================
-- AUTO-GENERATE SKU FUNCTION
-- Generates SKU based on category: SOF-001, CHR-002, etc.
-- =====================================================
CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
DECLARE
    category_prefix TEXT;
    next_number INTEGER;
    new_sku TEXT;
BEGIN
    -- Only generate SKU if not provided
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        -- Get category prefix (first 3 letters uppercase)
        category_prefix := UPPER(SUBSTRING(NEW.category FROM 1 FOR 3));
        
        -- Find the highest number for this category
        SELECT COALESCE(MAX(
            CAST(
                SUBSTRING(sku FROM '[0-9]+$') AS INTEGER
            )
        ), 0) + 1 INTO next_number
        FROM products
        WHERE sku LIKE category_prefix || '-%';
        
        -- Generate new SKU with zero-padded number
        new_sku := category_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
        
        NEW.sku := new_sku;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create SKU auto-generation trigger
DROP TRIGGER IF EXISTS generate_sku_trigger ON products;
CREATE TRIGGER generate_sku_trigger
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION generate_product_sku();

-- Update the updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
