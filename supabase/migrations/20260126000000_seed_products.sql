-- =====================================================
-- VIRTUALFURNISH PRODUCT SEED DATA
-- Comprehensive furniture catalog with variants
-- Generated: 2026-01-26
-- =====================================================

-- Clear existing products and variants (optional - comment out if you want to preserve)
-- TRUNCATE TABLE product_variants CASCADE;
-- TRUNCATE TABLE products CASCADE;

-- =====================================================
-- INSERT MAIN PRODUCTS
-- =====================================================

-- Sofas
INSERT INTO products (name, description, brand, category, base_price, sku, image_url, is_active) VALUES
('Modern L-Shape Sofa', 'Contemporary L-shaped sofa with premium fabric upholstery and solid wood frame. Perfect for modern living rooms.', 'Urban Living', 'Sofa', 24999.00, 'SOF-001', 'https://images.unsplash.com/photo-1667584523303-5d9e6779382b', true),
('Recliner Sofa Set', 'Premium 3-seater recliner sofa with manual recline mechanism. Features genuine leather upholstery.', 'Comfort Zone', 'Sofa', 45000.00, 'SOF-009', 'https://images.unsplash.com/photo-1705028877368-43d73100c1fd', true)
ON CONFLICT (sku) DO NOTHING;

-- Chairs
INSERT INTO products (name, description, brand, category, base_price, sku, image_url, is_active) VALUES
('Executive Office Chair', 'Ergonomic executive office chair with high back support and adjustable armrests. Features premium leather upholstery.', 'WorkSpace Pro', 'Chair', 8999.00, 'CHR-002', 'https://img.rocket.new/generatedImages/rocket_gen_img_11b201e6f-1764832795834.png', true),
('Velvet Accent Chair', 'Luxurious velvet accent chair with gold metal legs. Features deep button tufting and curved armrests.', 'Elegant Decor', 'Chair', 6800.00, 'CHR-007', 'https://img.rocket.new/generatedImages/rocket_gen_img_1fa73df78-1764795294797.png', true),
('Dining Chair Set', 'Set of 2 modern dining chairs with fabric upholstery and wooden legs. Features comfortable padded seats.', 'Dining Elite', 'Chair', 3200.00, 'CHR-013', 'https://images.unsplash.com/photo-1707923745240-628a850ae237', true)
ON CONFLICT (sku) DO NOTHING;

-- Tables
INSERT INTO products (name, description, brand, category, base_price, sku, image_url, is_active) VALUES
('Solid Wood Dining Table', 'Handcrafted solid oak dining table with natural wood finish. Seats 6-8 people comfortably.', 'Nordic Home', 'Table', 18500.00, 'TBL-003', 'https://images.unsplash.com/photo-1674797878035-4fdb18d3343b', true),
('Marble Coffee Table', 'Contemporary coffee table with genuine marble top and gold metal base. Features elegant design.', 'Modern Living', 'Table', 9999.00, 'TBL-008', 'https://images.unsplash.com/photo-1622527561244-74e49a3878a1', true),
('Console Table', 'Elegant console table with drawer storage and lower shelf. Perfect for entryways and hallways.', 'Entry Elegance', 'Table', 7800.00, 'TBL-014', 'https://images.unsplash.com/photo-1722650363326-9dcd45f43742', true)
ON CONFLICT (sku) DO NOTHING;

-- Beds
INSERT INTO products (name, description, brand, category, base_price, sku, image_url, is_active) VALUES
('Queen Size Platform Bed', 'Modern platform bed with upholstered headboard and storage drawers. Queen size with sturdy slat support.', 'Dream Rest', 'Bed', 32000.00, 'BED-004', 'https://img.rocket.new/generatedImages/rocket_gen_img_147093a9f-1764775756664.png', true),
('King Size Bed Frame', 'Luxury king size bed frame with leather headboard and LED lighting. Features hydraulic storage.', 'Luxury Sleep', 'Bed', 38500.00, 'BED-012', 'https://images.unsplash.com/photo-1722604831167-8583e0772c5b', true)
ON CONFLICT (sku) DO NOTHING;

-- Cabinets & Storage
INSERT INTO products (name, description, brand, category, base_price, sku, image_url, is_active) VALUES
('Glass Display Cabinet', 'Elegant glass display cabinet with LED lighting and adjustable shelves. Perfect for showcasing collectibles.', 'Display Pro', 'Cabinet', 15800.00, 'CAB-005', 'https://images.unsplash.com/photo-1722078139141-279c26e08abb', true),
('Bookshelf Cabinet', 'Tall bookshelf cabinet with 5 adjustable shelves. Features sturdy construction and classic design.', 'Library Style', 'Cabinet', 11200.00, 'CAB-010', 'https://img.rocket.new/generatedImages/rocket_gen_img_1f25dd3de-1764684031226.png', true),
('Wardrobe Cabinet', 'Spacious 3-door wardrobe with hanging rod, shelves, and drawers. Features mirror door and soft-close mechanism.', 'Closet King', 'Cabinet', 28000.00, 'CAB-015', 'https://img.rocket.new/generatedImages/rocket_gen_img_19243aaf6-1764702217826.png', true)
ON CONFLICT (sku) DO NOTHING;

-- Desks
INSERT INTO products (name, description, brand, category, base_price, sku, image_url, is_active) VALUES
('Standing Computer Desk', 'Height-adjustable standing desk with electric motor. Features spacious work surface and cable management system.', 'WorkSpace Pro', 'Desk', 12500.00, 'DSK-006', 'https://img.rocket.new/generatedImages/rocket_gen_img_17b317373-1764840509664.png', true),
('Kids Study Desk', 'Colorful study desk designed for children with storage compartments and adjustable height.', 'Kids Space', 'Desk', 5500.00, 'DSK-011', 'https://img.rocket.new/generatedImages/rocket_gen_img_177eda7c4-1764998661084.png', true)
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- INSERT PRODUCT VARIANTS
-- =====================================================

-- Modern L-Shape Sofa Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material, size) 
SELECT id, 'Brown Fabric', 'SOF-001-BRN', 24999.00, 15, 'Brown', 'Fabric', '220cm x 150cm'
FROM products WHERE sku = 'SOF-001'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material, size) 
SELECT id, 'Gray Fabric', 'SOF-001-GRY', 24999.00, 12, 'Gray', 'Fabric', '220cm x 150cm'
FROM products WHERE sku = 'SOF-001'
ON CONFLICT (sku) DO NOTHING;

-- Executive Office Chair Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Black Leather', 'CHR-002-BLK', 8999.00, 28, 'Black', 'Leather'
FROM products WHERE sku = 'CHR-002'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Brown Leather', 'CHR-002-BRN', 8999.00, 18, 'Brown', 'Leather'
FROM products WHERE sku = 'CHR-002'
ON CONFLICT (sku) DO NOTHING;

-- Solid Wood Dining Table Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material, size) 
SELECT id, 'Natural Oak', 'TBL-003-OAK', 18500.00, 8, 'Natural Oak', 'Solid Oak Wood', '200cm x 100cm'
FROM products WHERE sku = 'TBL-003'
ON CONFLICT (sku) DO NOTHING;

-- Queen Size Platform Bed Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Gray Upholstered', 'BED-004-GRY', 32000.00, 5, 'Gray', 'Fabric'
FROM products WHERE sku = 'BED-004'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Beige Upholstered', 'BED-004-BGE', 32000.00, 7, 'Beige', 'Fabric'
FROM products WHERE sku = 'BED-004'
ON CONFLICT (sku) DO NOTHING;

-- Glass Display Cabinet Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'White Frame', 'CAB-005-WHT', 15800.00, 12, 'White', 'Tempered Glass, MDF'
FROM products WHERE sku = 'CAB-005'
ON CONFLICT (sku) DO NOTHING;

-- Bookshelf Cabinet Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Oak Finish', 'CAB-010-OAK', 11200.00, 14, 'Oak', 'Engineered Wood'
FROM products WHERE sku = 'CAB-010'
ON CONFLICT (sku) DO NOTHING;

-- Marble Coffee Table Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'White Marble', 'TBL-008-WHT', 9999.00, 10, 'White', 'Marble, Metal'
FROM products WHERE sku = 'TBL-008'
ON CONFLICT (sku) DO NOTHING;

-- Standing Computer Desk Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Black Frame', 'DSK-006-BLK', 12500.00, 20, 'Black', 'Laminated Wood, Steel'
FROM products WHERE sku = 'DSK-006'
ON CONFLICT (sku) DO NOTHING;

-- Velvet Accent Chair Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Navy Blue Velvet', 'CHR-007-BLU', 6800.00, 18, 'Navy Blue', 'Velvet, Metal'
FROM products WHERE sku = 'CHR-007'
ON CONFLICT (sku) DO NOTHING;

-- Console Table Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'White Console', 'TBL-014-WHT', 7800.00, 16, 'White', 'MDF, Wood'
FROM products WHERE sku = 'TBL-014'
ON CONFLICT (sku) DO NOTHING;

-- Wardrobe Cabinet Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Brown Wardrobe', 'CAB-015-BRN', 28000.00, 6, 'Brown', 'Engineered Wood'
FROM products WHERE sku = 'CAB-015'
ON CONFLICT (sku) DO NOTHING;

-- Kids Study Desk Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Pink Desk', 'DSK-011-PNK', 5500.00, 22, 'Pink', 'MDF, Plastic'
FROM products WHERE sku = 'DSK-011'
ON CONFLICT (sku) DO NOTHING;

-- Dining Chair Set Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Gray Chairs', 'CHR-013-GRY', 3200.00, 0, 'Gray', 'Fabric, Wood'
FROM products WHERE sku = 'CHR-013'
ON CONFLICT (sku) DO NOTHING;

-- Recliner Sofa Set Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Brown Leather', 'SOF-009-BRN', 45000.00, 3, 'Brown', 'Genuine Leather'
FROM products WHERE sku = 'SOF-009'
ON CONFLICT (sku) DO NOTHING;

-- King Size Bed Frame Variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, color, material) 
SELECT id, 'Black Leather', 'BED-012-BLK', 38500.00, 4, 'Black', 'Leather, Solid Wood'
FROM products WHERE sku = 'BED-012'
ON CONFLICT (sku) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE '✅ Product Seed Data Migration Completed Successfully';
    RAISE NOTICE '🛋️ Inserted 15 furniture products';
    RAISE NOTICE '🎨 Added 20 product variants with stock information';
    RAISE NOTICE '📦 Database is ready for catalog operations';
END $$;
