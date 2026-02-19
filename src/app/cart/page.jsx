import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CartInteractive from './components/CartInteractive';
import CartProtection from './components/CartProtection';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shopping Cart - VirtualFurnish',
  description: 'Review your selected furniture items and proceed to checkout at Brosas Furniture Store.'
};

export default function CartPage() {
  return (
    <CartProtection>
      <div className="min-h-screen bg-background">
        <Sidebar userRole="customer" />
        <Header userRole="customer" />
        <main className="pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <Breadcrumb />
            </div>
            
            <CartInteractive />
          </div>
        </main>
      </div>
    </CartProtection>
  );
}