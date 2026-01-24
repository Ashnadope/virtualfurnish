


import VirtualRoomDesignerInteractive from './components/VirtualRoomDesignerInteractive';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Virtual Room Designer - VirtualFurnish',
  description: 'Upload your room photo and arrange furniture with AI-powered layout suggestions and color matching recommendations from Brosas Furniture Store.'
};

export default function VirtualRoomDesignerPage() {
  const furnitureData = [
    { id: 'sofa-001', name: 'Modern L-Shape Sofa', category: 'Sofas', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c710d12e-1764752237286.png', alt: 'Modern gray L-shaped sectional sofa with clean lines and plush cushions in contemporary living room', price: 45999, dimensions: '280cm x 180cm x 85cm', material: 'Premium Fabric', variants: [{ id: 'v1-1', name: 'Gray', sku: 'SOF-001-GRY', price: 45999, stockQuantity: 8 }], stock: 8 },
    { id: 'sofa-002', name: 'Classic Chesterfield Sofa', category: 'Sofas', image: 'https://images.unsplash.com/photo-1598300174929-5a05e2e9b3d0', alt: 'Elegant brown leather Chesterfield sofa with button tufting and rolled arms', price: 52999, dimensions: '220cm x 90cm x 78cm', material: 'Genuine Leather', variants: [{ id: 'v2-1', name: 'Brown', sku: 'SOF-002-BRN', price: 52999, stockQuantity: 5 }], stock: 5 },
    { id: 'table-001', name: 'Oak Dining Table', category: 'Tables', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f054d569-1764651051733.png', alt: 'Solid oak rectangular dining table with natural wood grain finish and sturdy legs', price: 28999, dimensions: '180cm x 90cm x 75cm', material: 'Solid Oak Wood', variants: [{ id: 'v3-1', name: 'Oak', sku: 'TBL-003-OAK', price: 28999, stockQuantity: 12 }], stock: 12 },
    { id: 'table-002', name: 'Glass Coffee Table', category: 'Tables', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_169f683f9-1764651057136.png', alt: 'Modern glass-top coffee table with chrome metal frame and minimalist design', price: 15999, dimensions: '120cm x 60cm x 45cm', material: 'Tempered Glass & Chrome', variants: [{ id: 'v4-1', name: 'Glass', sku: 'TBL-008-GLS', price: 15999, stockQuantity: 15 }], stock: 15 },
    { id: 'chair-001', name: 'Ergonomic Office Chair', category: 'Chairs', image: 'https://images.unsplash.com/photo-1713968686455-1af80cfd7b58', alt: 'Black mesh ergonomic office chair with adjustable armrests and lumbar support', price: 12999, dimensions: '65cm x 65cm x 120cm', material: 'Mesh & Steel Frame', variants: [{ id: 'v5-1', name: 'Black', sku: 'CHR-002-BLK', price: 12999, stockQuantity: 20 }], stock: 20 },
    { id: 'chair-002', name: 'Velvet Accent Chair', category: 'Chairs', image: 'https://images.unsplash.com/photo-1708895367956-7308c6962f72', alt: 'Luxurious emerald green velvet accent chair with gold metal legs and curved backrest', price: 18999, dimensions: '75cm x 80cm x 85cm', material: 'Velvet & Metal', variants: [{ id: 'v6-1', name: 'Green', sku: 'CHR-007-GRN', price: 18999, stockQuantity: 10 }], stock: 10 },
    { id: 'storage-001', name: 'Wooden Bookshelf', category: 'Storage', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f25dd3de-1764684031226.png', alt: 'Tall wooden bookshelf with five open shelves in walnut finish', price: 22999, dimensions: '120cm x 40cm x 200cm', material: 'Engineered Wood', variants: [{ id: 'v7-1', name: 'Walnut', sku: 'CAB-010-OAK', price: 22999, stockQuantity: 7 }], stock: 7 },
    { id: 'storage-002', name: 'Modern TV Console', category: 'Storage', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15dc7d473-1764936010243.png', alt: 'Sleek white TV console with two drawers and open shelf compartments', price: 19999, dimensions: '180cm x 45cm x 55cm', material: 'MDF & Laminate', variants: [{ id: 'v8-1', name: 'White', sku: 'CAB-011-WHT', price: 19999, stockQuantity: 9 }], stock: 9 },
    { id: 'bed-001', name: 'King Size Platform Bed', category: 'Beds', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19a59142e-1764752238242.png', alt: 'Modern king size platform bed with upholstered gray headboard and wooden frame', price: 38999, dimensions: '200cm x 180cm x 120cm', material: 'Upholstered Fabric & Wood', variants: [{ id: 'v9-1', name: 'King', sku: 'BED-012-KNG', price: 38999, stockQuantity: 6 }], stock: 6 },
    { id: 'bed-002', name: 'Queen Bed with Storage', category: 'Beds', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1abf1e682-1764754188053.png', alt: 'Queen size bed with built-in storage drawers underneath and tufted headboard', price: 42999, dimensions: '200cm x 160cm x 110cm', material: 'Wood & Fabric', variants: [{ id: 'v10-1', name: 'Queen', sku: 'BED-012-Q', price: 42999, stockQuantity: 4 }], stock: 4 },
    { id: 'decor-001', name: 'Floor Standing Lamp', category: 'Decor', image: 'https://images.unsplash.com/photo-1696177843249-f1cce9bcf4cb', alt: 'Contemporary floor standing lamp with tripod wooden legs and white fabric shade', price: 8999, dimensions: '50cm x 50cm x 160cm', material: 'Wood & Fabric', variants: [{ id: 'v11-1', name: 'Lamp', sku: 'DEC-001', price: 8999, stockQuantity: 18 }], stock: 18 },
    { id: 'decor-002', name: 'Wall Mirror Set', category: 'Decor', image: 'https://images.unsplash.com/photo-1706561941535-826e3b121072', alt: 'Set of three round wall mirrors with gold metal frames in different sizes', price: 6999, dimensions: '60cm, 45cm, 30cm diameter', material: 'Glass & Metal', variants: [{ id: 'v12-1', name: 'Mirror Set', sku: 'DEC-002', price: 6999, stockQuantity: 25 }], stock: 25 }
  ];


  return <VirtualRoomDesignerInteractive initialFurnitureData={furnitureData} />;
}