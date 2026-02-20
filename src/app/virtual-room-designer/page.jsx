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

  // Transform products → one furniture entry per active variant
  // This lets the room designer show each color/variant separately
  const furnitureData = products.flatMap((product) => {
    // Only variants that are active AND have stock
    const activeVariants = (product.variants || []).filter(
      v => v?.isActive !== false && (parseInt(v?.stockQuantity) || 0) > 0
    );

    if (activeVariants.length === 0) return [];

    return activeVariants.map((variant) => ({
      // Unique id per variant so the canvas can place multiple variants of the same product
      id: variant.id,
      productId: product.id,
      name: variant.color
        ? `${product.name} (${variant.color})`
        : product.name,
      category: product.category,
      image: variant.imageUrl || null,
      alt: `${product.name}${variant.color ? ` - ${variant.color}` : ''} | ${product.description || product.category}`,
      price: variant.price ?? product.basePrice,
      color: variant.color,
      dimensions: variant.dimensions,
      material: variant.material,
      weight: variant.weight,
      stock: variant.stockQuantity ?? 0,
      // Keep full variant + product refs for cart/wishlist actions
      variantId: variant.id,
      sku: variant.sku,
    }));
  });

  return <VirtualRoomDesignerInteractive initialFurnitureData={furnitureData} />;
}