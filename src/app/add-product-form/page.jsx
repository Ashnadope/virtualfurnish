import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import Breadcrumb from '@/components/common/Breadcrumb';
import AddProductFormInteractive from './components/AddProductFormInteractive';

export const metadata = {
  title: 'Add Product Form - Brosas Furniture Store',
  description: 'Create new furniture products with comprehensive data entry and validation',
};

export default function AddProductFormPage() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin-dashboard' },
    { label: 'Product Management', href: '/product-management' },
    { label: 'Add Product', href: '/add-product-form', active: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" userName="Admin User" />
      <Sidebar userRole="admin" />
      
      <main className="pt-16 pl-0 lg:pl-64">
        <div className="container-responsive py-6 px-4 md:px-6">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                  Add New Product
                </h1>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Create a new furniture product with comprehensive details and specifications
                </p>
              </div>
            </div>

            <AddProductFormInteractive />
          </div>
        </div>
      </main>
    </div>
  );
}