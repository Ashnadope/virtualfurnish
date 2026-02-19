import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AdminDashboardInteractive from './components/AdminDashboardInteractive';
import AdminProtection from './components/AdminProtection';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard - VirtualFurnish',
  description: 'Monitor business operations, manage inventory, process orders, and access analytics for Brosas Furniture Store.'
};

export default function AdminDashboard() {
  const dashboardData = {
    metrics: [
    {
      id: 1,
      title: 'Daily Sales',
      value: '₱45,230.00',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'CurrencyDollarIcon',
      iconBg: 'bg-success'
    },
    {
      id: 2,
      title: 'Total Orders',
      value: '127',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'ShoppingBagIcon',
      iconBg: 'bg-primary'
    },
    {
      id: 3,
      title: 'Inventory Alerts',
      value: '23',
      change: '+5',
      changeType: 'negative',
      icon: 'ExclamationTriangleIcon',
      iconBg: 'bg-warning'
    },
    {
      id: 4,
      title: 'New Customers',
      value: '18',
      change: '+3.1%',
      changeType: 'positive',
      icon: 'UserGroupIcon',
      iconBg: 'bg-accent'
    }],

    quickActions: [
    {
      id: 1,
      title: 'Add New Product',
      description: 'Create and list new furniture items',
      icon: 'PlusCircleIcon',
      iconBg: 'bg-primary',
      href: '/product-management'
    },
    {
      id: 2,
      title: 'Process Orders',
      description: 'Review and fulfill pending orders',
      icon: 'ClipboardDocumentCheckIcon',
      iconBg: 'bg-success',
      href: '/admin-dashboard'
    },
    {
      id: 3,
      title: 'Manage Inventory',
      description: 'Update stock levels and pricing',
      icon: 'CubeIcon',
      iconBg: 'bg-warning',
      href: '/product-management'
    },
    {
      id: 4,
      title: 'View Analytics',
      description: 'Access sales reports and insights',
      icon: 'ChartBarIcon',
      iconBg: 'bg-accent',
      href: '/analytics-dashboard'
    }],

    recentActivities: [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      description: 'Order #ORD-2025-1234 from Maria Santos - 3 items, ₱18,500.00',
      time: '5 minutes ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'inquiry',
      title: 'Customer Inquiry',
      description: 'Juan Dela Cruz asked about Modern Sofa Set delivery options',
      time: '15 minutes ago',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Low Stock Alert',
      description: 'Scandinavian Dining Table has only 2 units remaining',
      time: '1 hour ago',
      priority: 'high'
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Shipped',
      description: 'Order #ORD-2025-1230 has been dispatched to customer',
      time: '2 hours ago',
      priority: 'normal'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      description: 'Inventory sync completed successfully - 245 products updated',
      time: '3 hours ago',
      priority: 'normal'
    },
    {
      id: 6,
      type: 'inquiry',
      title: 'Product Review Posted',
      description: 'New 5-star review for Classic Wooden Bed Frame',
      time: '4 hours ago',
      priority: 'normal'
    }],

    inventoryAlerts: [
    {
      id: 1,
      name: 'Modern Leather Sofa',
      sku: 'SOF-ML-001',
      stock: 0,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c710d12e-1764752237286.png",
      alt: 'Modern gray leather three-seater sofa with chrome legs in contemporary living room'
    },
    {
      id: 2,
      name: 'Scandinavian Dining Table',
      sku: 'TBL-SD-002',
      stock: 2,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f054d569-1764651051733.png",
      alt: 'Light oak Scandinavian dining table with clean lines and tapered legs'
    },
    {
      id: 3,
      name: 'Velvet Accent Chair',
      sku: 'CHR-VA-003',
      stock: 3,
      image: "https://images.unsplash.com/photo-1708895367956-7308c6962f72",
      alt: 'Emerald green velvet accent chair with gold metal legs and button tufting'
    },
    {
      id: 4,
      name: 'Industrial Bookshelf',
      sku: 'SHF-IB-004',
      stock: 1,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1be5dca18-1764664379862.png",
      alt: 'Black metal and reclaimed wood industrial bookshelf with five shelves'
    }],

    salesData: [
    { date: '01 Dec', revenue: 32500 },
    { date: '02 Dec', revenue: 28900 },
    { date: '03 Dec', revenue: 41200 },
    { date: '04 Dec', revenue: 38700 },
    { date: '05 Dec', revenue: 45230 },
    { date: '06 Dec', revenue: 39800 },
    { date: '07 Dec', revenue: 43100 }],

    pendingOrders: [
    {
      id: 1,
      orderNumber: 'ORD-2025-1234',
      customerName: 'Maria Santos',
      items: 3,
      total: 18500,
      date: '06/12/2025',
      status: 'pending'
    },
    {
      id: 2,
      orderNumber: 'ORD-2025-1233',
      customerName: 'Juan Dela Cruz',
      items: 1,
      total: 12300,
      date: '06/12/2025',
      status: 'pending'
    },
    {
      id: 3,
      orderNumber: 'ORD-2025-1232',
      customerName: 'Ana Reyes',
      items: 5,
      total: 34700,
      date: '05/12/2025',
      status: 'processing'
    },
    {
      id: 4,
      orderNumber: 'ORD-2025-1231',
      customerName: 'Pedro Garcia',
      items: 2,
      total: 15900,
      date: '05/12/2025',
      status: 'pending'
    }]

  };

  return (
    <AdminProtection>
      <div className="min-h-screen bg-background">
        <Sidebar userRole="admin" />
        <Header userRole="admin" userName="Maryjoy and Joel" />
        
        <main className="pt-16">
          <div className="p-6 lg:p-8">
            <div className="mb-6">
              <Breadcrumb />
              <h1 className="font-heading text-3xl font-bold text-foreground mt-4 mb-2">Admin Dashboard</h1>
              <p className="font-body text-base text-muted-foreground">
                Monitor business operations and manage Brosas Furniture Store
              </p>
            </div>

            <AdminDashboardInteractive initialData={dashboardData} />
          </div>
        </main>
      </div>
    </AdminProtection>
  );

}