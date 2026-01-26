
import { productService } from '@/services/product.service';
import CatalogInteractive from './components/CatalogInteractive';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Furniture Catalog - VirtualFurnish',
  description: 'Browse our complete furniture collection with detailed product information and pricing'
};

export default async function FurnitureCatalogPage() {
  // Fetch products from database
  const { data: products = [], error } = await productService.getAllProducts();

  if (error) {
    console.error('Error fetching products:', error);
  }

  return <CatalogInteractive initialProducts={products} />;
}