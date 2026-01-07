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
  {
    id: 1,
    name: "Modern L-Shape Sofa",
    sku: "SOF-001-BRN",
    category: "Sofa",
    price: 24999.00,
    stock: 15,
    status: "active",
    description: "Contemporary L-shaped sofa with premium fabric upholstery and solid wood frame. Features deep seating and plush cushions for maximum comfort. Perfect for modern living rooms.",
    dimensions: "280 x 180 x 85 cm",
    material: "Fabric, Solid Wood Frame",
    weight: "65 kg",
    color: "Brown",
    image: "https://images.unsplash.com/photo-1667584523303-5d9e6779382b",
    imageAlt: "Modern brown L-shaped sectional sofa with plush cushions in contemporary living room setting"
  },
  {
    id: 2,
    name: "Executive Office Chair",
    sku: "CHR-002-BLK",
    category: "Chair",
    price: 8999.00,
    stock: 28,
    status: "active",
    description: "Ergonomic executive office chair with high back support and adjustable armrests. Features premium leather upholstery and 360-degree swivel base.",
    dimensions: "65 x 70 x 120 cm",
    material: "Leather, Metal Base",
    weight: "18 kg",
    color: "Black",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_11b201e6f-1764832795834.png",
    imageAlt: "Black leather executive office chair with high back and chrome base in modern office"
  },
  {
    id: 3,
    name: "Solid Wood Dining Table",
    sku: "TBL-003-OAK",
    category: "Table",
    price: 18500.00,
    stock: 8,
    status: "active",
    description: "Handcrafted solid oak dining table with natural wood finish. Seats 6-8 people comfortably. Features sturdy construction and timeless design.",
    dimensions: "200 x 100 x 75 cm",
    material: "Solid Oak Wood",
    weight: "55 kg",
    color: "Natural Oak",
    image: "https://images.unsplash.com/photo-1674797878035-4fdb18d3343b",
    imageAlt: "Natural oak solid wood dining table with six chairs in bright dining room"
  },
  {
    id: 4,
    name: "Queen Size Platform Bed",
    sku: "BED-004-GRY",
    category: "Bed",
    price: 32000.00,
    stock: 5,
    status: "active",
    description: "Modern platform bed with upholstered headboard and storage drawers. Queen size with sturdy slat support system. No box spring required.",
    dimensions: "210 x 160 x 110 cm",
    material: "Fabric, Engineered Wood",
    weight: "75 kg",
    color: "Gray",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_147093a9f-1764775756664.png",
    imageAlt: "Gray upholstered queen platform bed with tufted headboard in modern bedroom"
  },
  {
    id: 5,
    name: "Glass Display Cabinet",
    sku: "CAB-005-WHT",
    category: "Cabinet",
    price: 15800.00,
    stock: 12,
    status: "active",
    description: "Elegant glass display cabinet with LED lighting and adjustable shelves. Perfect for showcasing collectibles and decorative items.",
    dimensions: "90 x 45 x 180 cm",
    material: "Tempered Glass, MDF",
    weight: "42 kg",
    color: "White",
    image: "https://images.unsplash.com/photo-1722078139141-279c26e08abb",
    imageAlt: "White glass display cabinet with LED lighting showing decorative items on shelves"
  },
  {
    id: 6,
    name: "Standing Computer Desk",
    sku: "DSK-006-BLK",
    category: "Desk",
    price: 12500.00,
    stock: 20,
    status: "active",
    description: "Height-adjustable standing desk with electric motor. Features spacious work surface and cable management system. Promotes healthy work posture.",
    dimensions: "140 x 70 x 75-120 cm",
    material: "Laminated Wood, Steel Frame",
    weight: "35 kg",
    color: "Black",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_17b317373-1764840509664.png",
    imageAlt: "Black height-adjustable standing desk with laptop and monitor in modern home office"
  },
  {
    id: 7,
    name: "Velvet Accent Chair",
    sku: "CHR-007-BLU",
    category: "Chair",
    price: 6800.00,
    stock: 18,
    status: "active",
    description: "Luxurious velvet accent chair with gold metal legs. Features deep button tufting and curved armrests. Perfect for living rooms and bedrooms.",
    dimensions: "75 x 80 x 85 cm",
    material: "Velvet, Metal Legs",
    weight: "15 kg",
    color: "Navy Blue",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fa73df78-1764795294797.png",
    imageAlt: "Navy blue velvet accent chair with gold legs and button tufting in elegant living room"
  },
  {
    id: 8,
    name: "Marble Coffee Table",
    sku: "TBL-008-WHT",
    category: "Table",
    price: 9999.00,
    stock: 10,
    status: "active",
    description: "Contemporary coffee table with genuine marble top and gold metal base. Features elegant design and durable construction.",
    dimensions: "120 x 60 x 45 cm",
    material: "Marble, Metal Base",
    weight: "38 kg",
    color: "White Marble",
    image: "https://images.unsplash.com/photo-1622527561244-74e49a3878a1",
    imageAlt: "White marble coffee table with gold metal base in modern living room"
  },
  {
    id: 9,
    name: "Recliner Sofa Set",
    sku: "SOF-009-BRN",
    category: "Sofa",
    price: 45000.00,
    stock: 3,
    status: "active",
    description: "Premium 3-seater recliner sofa with manual recline mechanism. Features genuine leather upholstery and padded armrests. Ultimate comfort for relaxation.",
    dimensions: "220 x 95 x 100 cm",
    material: "Genuine Leather, Steel Frame",
    weight: "85 kg",
    color: "Brown",
    image: "https://images.unsplash.com/photo-1705028877368-43d73100c1fd",
    imageAlt: "Brown leather three-seater recliner sofa with extended footrests in cozy living room"
  },
  {
    id: 10,
    name: "Bookshelf Cabinet",
    sku: "CAB-010-OAK",
    category: "Cabinet",
    price: 11200.00,
    stock: 14,
    status: "active",
    description: "Tall bookshelf cabinet with 5 adjustable shelves. Features sturdy construction and classic design. Perfect for home libraries and offices.",
    dimensions: "80 x 35 x 200 cm",
    material: "Engineered Wood",
    weight: "32 kg",
    color: "Oak",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f25dd3de-1764684031226.png",
    imageAlt: "Oak bookshelf cabinet with five shelves filled with books in home office"
  },
  {
    id: 11,
    name: "Kids Study Desk",
    sku: "DSK-011-PNK",
    category: "Desk",
    price: 5500.00,
    stock: 22,
    status: "active",
    description: "Colorful study desk designed for children with storage compartments and adjustable height. Features rounded edges for safety.",
    dimensions: "100 x 60 x 65-75 cm",
    material: "MDF, Plastic",
    weight: "18 kg",
    color: "Pink",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_177eda7c4-1764998661084.png",
    imageAlt: "Pink children\'s study desk with storage compartments and adjustable height in kids room"
  },
  {
    id: 12,
    name: "King Size Bed Frame",
    sku: "BED-012-BLK",
    category: "Bed",
    price: 38500.00,
    stock: 4,
    status: "active",
    description: "Luxury king size bed frame with leather headboard and LED lighting. Features hydraulic storage and premium construction.",
    dimensions: "220 x 200 x 120 cm",
    material: "Leather, Solid Wood",
    weight: "95 kg",
    color: "Black",
    image: "https://images.unsplash.com/photo-1722604831167-8583e0772c5b",
    imageAlt: "Black leather king size bed frame with LED headboard lighting in luxury bedroom"
  },
  {
    id: 13,
    name: "Dining Chair Set",
    sku: "CHR-013-GRY",
    category: "Chair",
    price: 3200.00,
    stock: 0,
    status: "inactive",
    description: "Set of 2 modern dining chairs with fabric upholstery and wooden legs. Features comfortable padded seats and contemporary design.",
    dimensions: "45 x 55 x 90 cm",
    material: "Fabric, Wood",
    weight: "7 kg",
    color: "Gray",
    image: "https://images.unsplash.com/photo-1707923745240-628a850ae237",
    imageAlt: "Gray fabric dining chairs with wooden legs around dining table"
  },
  {
    id: 14,
    name: "Console Table",
    sku: "TBL-014-WHT",
    category: "Table",
    price: 7800.00,
    stock: 16,
    status: "active",
    description: "Elegant console table with drawer storage and lower shelf. Perfect for entryways and hallways. Features clean white finish.",
    dimensions: "120 x 35 x 80 cm",
    material: "MDF, Wood",
    weight: "22 kg",
    color: "White",
    image: "https://images.unsplash.com/photo-1722650363326-9dcd45f43742",
    imageAlt: "White console table with drawer and shelf displaying decorative items in hallway"
  },
  {
    id: 15,
    name: "Wardrobe Cabinet",
    sku: "CAB-015-BRN",
    category: "Cabinet",
    price: 28000.00,
    stock: 6,
    status: "active",
    description: "Spacious 3-door wardrobe with hanging rod, shelves, and drawers. Features mirror door and soft-close mechanism.",
    dimensions: "180 x 60 x 220 cm",
    material: "Engineered Wood",
    weight: "110 kg",
    color: "Brown",
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_19243aaf6-1764702217826.png",
    imageAlt: "Brown three-door wardrobe cabinet with mirror and organized interior in bedroom"
  }];


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