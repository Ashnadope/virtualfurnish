import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CartInteractive from './components/CartInteractive';

export const metadata = {
  title: 'Shopping Cart - VirtualFurnish',
  description: 'Review your selected furniture items and proceed to checkout at Brosas Furniture Store.'
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" />
      <main className="lg:ml-sidebar pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          <CartInteractive />
        </div>
      </main>
    </div>
  );
}