'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AdminOrdersInteractive from './components/AdminOrdersInteractive';
import LoadingSpinner from './components/LoadingSpinner';

export default function AdminOrders() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load completion
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
