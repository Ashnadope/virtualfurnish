import { productService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductDetailInteractive from '../components/ProductDetailInteractive';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const { data: product } = await productService.getProductById(id);
    
    if (!product) {
      return {
        title: 'Product Not Found - VirtualFurnish',
        description: 'The product you are looking for does not exist.'
      };
    }

    return {
      title: `${product?.name} - VirtualFurnish`,
      description: product?.description || `Shop ${product?.name} at VirtualFurnish`
    };
  } catch (error) {
    return {
      title: 'Product - VirtualFurnish',
      description: 'View product details and specifications'
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = params;

  try {
    const { data: product, error } = await productService.getProductById(id);

    if (error || !product) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        <Sidebar userRole="customer" />
        <Header userRole="customer" />
        <main className="pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <Breadcrumb />
            </div>
            
            <ProductDetailInteractive product={product} />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
