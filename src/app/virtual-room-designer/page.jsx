import { productService } from '@/services/product.service';
import VirtualRoomDesignerInteractive from './components/VirtualRoomDesignerInteractive';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Virtual Room Designer - VirtualFurnish',
  description: 'Upload your room photo and arrange furniture with AI-powered layout suggestions and color matching recommendations from Brosas Furniture Store.'
};

export default async function VirtualRoomDesignerPage() {
  // Fetch products from database
  const { data: products = [], error } = await productService.getAllProducts();

  if (error) {
    console.error('Error fetching products:', error);
  }

  // Transform database products to match the component's expected format
  const furnitureData = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.imageUrl,
    alt: product.description || `${product.name} - ${product.category}`,
    price: product.basePrice,
    dimensions: '200cm x 100cm x 80cm', // Default dimensions - could be added to DB
    material: product.description || 'Furniture',
    variants: product.variants?.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stockQuantity: v.stockQuantity
    })) || [],
    stock: product.variants?.reduce((total, v) => total + (v.stockQuantity || 0), 0) || 0
  }));

  return <VirtualRoomDesignerInteractive initialFurnitureData={furnitureData} />;
}