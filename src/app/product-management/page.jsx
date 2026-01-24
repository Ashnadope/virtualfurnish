import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductManagementInteractive from './components/ProductManagementInteractive';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Product Management - VirtualFurnish',
  description: 'Manage furniture inventory, add new products, update stock levels, and control product catalog for Brosas Furniture Store'
};

export default function ProductManagementPage() {
  const mockProducts = [
    { id: 1, name: 'Modern L-Shape Sofa', sku: 'SOF-001-BRN', category: 'Sofa', price: 24999.0, stock: 15, status: 'active', description: 'Contemporary L-shaped sofa with premium fabric upholstery and solid wood frame. Perfect for modern living rooms.', dimensions: '220cm x 150cm x 85cm', material: 'Fabric', weight: '75kg', color: 'Brown', image: 'https://images.unsplash.com/photo-1667584523303-5d9e6779382b', imageAlt: 'A modern brown L-shaped sofa.', variants: [{ id: 'v1-1', name: 'Brown', sku: 'SOF-001-BRN', price: 24999.0, stockQuantity: 15 }] },
    { id: 2, name: 'Executive Office Chair', sku: 'CHR-002-BLK', category: 'Chair', price: 8999.0, stock: 28, status: 'active', description: 'Ergonomic executive office chair with high back support and adjustable armrests. Features premium leather upholstery.', dimensions: '65cm x 70cm x 120cm', material: 'Leather', weight: '18kg', color: 'Black', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_11b201e6f-1764832795834.png', imageAlt: 'A black leather executive office chair.', variants: [{ id: 'v2-1', name: 'Black', sku: 'CHR-002-BLK', price: 8999.0, stockQuantity: 28 }] },
    { id: 3, name: 'Solid Wood Dining Table', sku: 'TBL-003-OAK', category: 'Table', price: 18500.0, stock: 8, status: 'active', description: 'Handcrafted solid oak dining table with natural wood finish. Seats 6-8 people comfortably.', dimensions: '200cm x 100cm x 75cm', material: 'Solid Oak Wood', weight: '55kg', color: 'Natural Oak', image: 'https://images.unsplash.com/photo-1674797878035-4fdb18d3343b', imageAlt: 'A solid oak dining table.', variants: [{ id: 'v3-1', name: 'Oak', sku: 'TBL-003-OAK', price: 18500.0, stockQuantity: 8 }] },
    { id: 4, name: 'Queen Size Platform Bed', sku: 'BED-004-GRY', category: 'Bed', price: 32000.0, stock: 5, status: 'active', description: 'Modern platform bed with upholstered headboard and storage drawers. Queen size with sturdy slat support.', dimensions: '210cm x 160cm x 110cm', material: 'Fabric', weight: '80kg', color: 'Gray', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_147093a9f-1764775756664.png', imageAlt: 'A gray queen size platform bed.', variants: [{ id: 'v4-1', name: 'Gray', sku: 'BED-004-GRY', price: 32000.0, stockQuantity: 5 }] },
    { id: 5, name: 'Glass Display Cabinet', sku: 'CAB-005-WHT', category: 'Cabinet', price: 15800.0, stock: 12, status: 'active', description: 'Elegant glass display cabinet with LED lighting and adjustable shelves. Perfect for showcasing collectibles.', dimensions: '90cm x 45cm x 180cm', material: 'Tempered Glass, MDF', weight: '45kg', color: 'White', image: 'https://images.unsplash.com/photo-1722078139141-279c26e08abb', imageAlt: 'A white glass display cabinet.', variants: [{ id: 'v5-1', name: 'White', sku: 'CAB-005-WHT', price: 15800.0, stockQuantity: 12 }] },
    { id: 6, name: 'Standing Computer Desk', sku: 'DSK-006-BLK', category: 'Desk', price: 12500.0, stock: 20, status: 'active', description: 'Height-adjustable standing desk with electric motor. Features spacious work surface and cable management system.', dimensions: '140cm x 70cm x 75-120cm', material: 'Laminated Wood, Steel', weight: '40kg', color: 'Black', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17b317373-1764840509664.png', imageAlt: 'A black standing computer desk.', variants: [{ id: 'v6-1', name: 'Black', sku: 'DSK-006-BLK', price: 12500.0, stockQuantity: 20 }] },
    { id: 7, name: 'Velvet Accent Chair', sku: 'CHR-007-BLU', category: 'Chair', price: 6800.0, stock: 18, status: 'active', description: 'Luxurious velvet accent chair with gold metal legs. Features deep button tufting and curved armrests.', dimensions: '75cm x 80cm x 85cm', material: 'Velvet, Metal', weight: '15kg', color: 'Navy Blue', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1fa73df78-1764795294797.png', imageAlt: 'A navy blue velvet accent chair.', variants: [{ id: 'v7-1', name: 'Navy Blue', sku: 'CHR-007-BLU', price: 6800.0, stockQuantity: 18 }] },
    { id: 8, name: 'Marble Coffee Table', sku: 'TBL-008-WHT', category: 'Table', price: 9999.0, stock: 10, status: 'active', description: 'Contemporary coffee table with genuine marble top and gold metal base. Features elegant design.', dimensions: '120cm x 60cm x 45cm', material: 'Marble, Metal', weight: '40kg', color: 'White Marble', image: 'https://images.unsplash.com/photo-1622527561244-74e49a3878a1', imageAlt: 'A marble coffee table.', variants: [{ id: 'v8-1', name: 'White Marble', sku: 'TBL-008-WHT', price: 9999.0, stockQuantity: 10 }] },
    { id: 9, name: 'Recliner Sofa Set', sku: 'SOF-009-BRN', category: 'Sofa', price: 45000.0, stock: 3, status: 'active', description: 'Premium 3-seater recliner sofa with manual recline mechanism. Features genuine leather upholstery.', dimensions: '220cm x 95cm x 100cm', material: 'Genuine Leather', weight: '90kg', color: 'Brown', image: 'https://images.unsplash.com/photo-1705028877368-43d73100c1fd', imageAlt: 'A brown recliner sofa set.', variants: [{ id: 'v9-1', name: 'Brown', sku: 'SOF-009-BRN', price: 45000.0, stockQuantity: 3 }] },
    { id: 10, name: 'Bookshelf Cabinet', sku: 'CAB-010-OAK', category: 'Cabinet', price: 11200.0, stock: 14, status: 'active', description: 'Tall bookshelf cabinet with 5 adjustable shelves. Features sturdy construction and classic design.', dimensions: '80cm x 35cm x 200cm', material: 'Engineered Wood', weight: '35kg', color: 'Oak', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f25dd3de-1764684031226.png', imageAlt: 'An oak bookshelf cabinet.', variants: [{ id: 'v10-1', name: 'Oak', sku: 'CAB-010-OAK', price: 11200.0, stockQuantity: 14 }] },
    { id: 11, name: 'Kids Study Desk', sku: 'DSK-011-PNK', category: 'Desk', price: 5500.0, stock: 22, status: 'active', description: 'Colorful study desk designed for children with storage compartments and adjustable height.', dimensions: '100cm x 60cm x 65-75cm', material: 'MDF, Plastic', weight: '20kg', color: 'Pink', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_177eda7c4-1764998661084.png', imageAlt: 'A pink kids study desk.', variants: [{ id: 'v11-1', name: 'Pink', sku: 'DSK-011-PNK', price: 5500.0, stockQuantity: 22 }] },
    { id: 12, name: 'King Size Bed Frame', sku: 'BED-012-BLK', category: 'Bed', price: 38500.0, stock: 4, status: 'active', description: 'Luxury king size bed frame with leather headboard and LED lighting. Features hydraulic storage.', dimensions: '220cm x 200cm x 120cm', material: 'Leather, Solid Wood', weight: '100kg', color: 'Black', image: 'https://images.unsplash.com/photo-1722604831167-8583e0772c5b', imageAlt: 'A black king size bed frame.', variants: [{ id: 'v12-1', name: 'Black', sku: 'BED-012-BLK', price: 38500.0, stockQuantity: 4 }] },
    { id: 13, name: 'Dining Chair Set', sku: 'CHR-013-GRY', category: 'Chair', price: 3200.0, stock: 0, status: 'inactive', description: 'Set of 2 modern dining chairs with fabric upholstery and wooden legs. Features comfortable padded seats.', dimensions: '45cm x 55cm x 90cm', material: 'Fabric, Wood', weight: '8kg', color: 'Gray', image: 'https://images.unsplash.com/photo-1707923745240-628a850ae237', imageAlt: 'A set of gray dining chairs.', variants: [{ id: 'v13-1', name: 'Gray', sku: 'CHR-013-GRY', price: 3200.0, stockQuantity: 0 }] },
    { id: 14, name: "Console Table", sku: "TBL-014-WHT", category: "Table", price: 7800.0, stock: 16, status: "active", description: "Elegant console table with drawer storage and lower shelf. Perfect for entryways and hallways.", dimensions: "120cm x 35cm x 80cm", material: "MDF, Wood", weight: "25kg", color: "White", image: "https://images.unsplash.com/photo-1722650363326-9dcd45f43742", imageAlt: "A white console table.", variants: [{ id: 'v14-1', name: 'White', sku: 'TBL-014-WHT', price: 7800.0, stockQuantity: 16 }] },
    { id: 15, name: "Wardrobe Cabinet", sku: "CAB-015-BRN", category: "Cabinet", price: 28000.0, stock: 6, status: "active", description: "Spacious 3-door wardrobe with hanging rod, shelves, and drawers. Features mirror door and soft-close mechanism.", dimensions: "180cm x 60cm x 220cm", material: "Engineered Wood", weight: "120kg", color: "Brown", image: "https://img.rocket.new/generatedImages/rocket_gen_img_19243aaf6-1764702217826.png", imageAlt: "A brown wardrobe cabinet.", variants: [{ id: 'v15-1', name: 'Brown', sku: 'CAB-015-BRN', price: 28000.0, stockQuantity: 6 }] }
  ];


  return (
    <>
      <Header userRole="admin" userName="Admin User" />
      <Sidebar userRole="admin" />
      
      <main className="lg:ml-sidebar pt-16 min-h-screen bg-background">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          <ProductManagementInteractive initialProducts={mockProducts} />
        </div>
      </main>
    </>);

}