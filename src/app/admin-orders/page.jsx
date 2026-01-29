import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AdminOrdersInteractive from './components/AdminOrdersInteractive';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Orders - Admin Dashboard - VirtualFurnish',
  description: 'View and manage all customer orders'
};

export default function AdminOrders() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="admin" />
      <Header userRole="admin" userName="Admin" />
      <main className="lg:ml-sidebar pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          <AdminOrdersInteractive />
        </div>
      </main>
    </div>
  );
}
