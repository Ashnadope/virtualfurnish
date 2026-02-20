import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductManagementInteractive from './components/ProductManagementInteractive';
import { productService } from '@/services/product.service';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Product Management - VirtualFurnish',
  description: 'Manage furniture inventory, add new products, update stock levels, and control product catalog for Brosas Furniture Store'
};

export default async function ProductManagementPage() {
  // Fetch products from database
  const { data: products = [], error } = await productService.getAllProducts();

  if (error) {
    console.error('Error fetching products:', error);
  }

  // Transform database products to match the component's expected format
  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: product.variants?.length > 0
      ? Math.min(...product.variants.map(v => parseFloat(v.price || 0)))
      : (product.basePrice ?? 0),
    stock: product.variants?.reduce((total, v) => total + (v.stockQuantity || 0), 0) || 0,
    status: product.isActive ? 'active' : 'inactive',
    description: product.description,
    image: product.variants?.[0]?.imageUrl || product.imageUrl || null,
    imageAlt: product.imageAlt,
    brand: product.brand,
    variants: product.variants || []
  }));

  return (
    <>
      <Header userRole="admin" userName="Admin User" />
      <Sidebar userRole="admin" />
      
      <main className="pt-16 min-h-screen bg-background">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          <ProductManagementInteractive initialProducts={formattedProducts} />
        </div>
      </main>
    </>);

}