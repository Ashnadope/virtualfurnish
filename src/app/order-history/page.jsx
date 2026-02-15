'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { generateInvoice, generateReceipt } from '../../utils/invoiceGenerator';
import OrderCard from './components/OrderCard';
import OrderFilters from './components/OrderFilters';
import OrderStats from './components/OrderStats';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyOrders from './components/EmptyOrders';
import ErrorMessage from './components/ErrorMessage';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: null,
    endDate: null
  });

  // Apply filters using useMemo to prevent infinite loops
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Status filter
    if (filters?.status && filters?.status !== 'all') {
      filtered = filtered?.filter(order => 
        order?.status?.toLowerCase() === filters?.status?.toLowerCase()
      );
    }

    // Search filter
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(order =>
        order?.orderNumber?.toLowerCase()?.includes(searchLower) ||
        order?.items?.some(item => 
          item?.name?.toLowerCase()?.includes(searchLower)
        )
      );
    }

    // Date range filter
    if (filters?.startDate) {
      filtered = filtered?.filter(order => 
        new Date(order?.createdAt) >= new Date(filters?.startDate)
      );
    }
    if (filters?.endDate) {
      filtered = filtered?.filter(order => 
        new Date(order?.createdAt) <= new Date(filters?.endDate)
      );
    }

    return filtered;
  }, [orders, filters]);

  // Load orders on mount
  useEffect(() => {
    console.log('[OrderHistory] useEffect triggered', { authLoading, userId: user?.id, ordersCount: orders.length });
    
    if (authLoading) {
      console.log('[OrderHistory] Still auth loading, waiting...');
      setLoading(true);
      return;
    }

    if (!user?.id) {
      console.log('[OrderHistory] No user, redirecting to login');
      router.push('/login');
      setLoading(false);
      return;
    }

    console.log('[OrderHistory] Loading orders and stats...');
    loadOrders();
    loadStats();
  }, [user?.id, authLoading, router]);

  const loadOrders = async () => {
    console.log('[OrderHistory] loadOrders called', { userId: user?.id });
    
    if (!user?.id) {
      console.log('[OrderHistory] No user in loadOrders');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('[OrderHistory] Fetching orders from Supabase...');
      // Fetch real orders from Supabase
      if (user?.id) {
        // Otherwise fetch from Supabase
        const data = await orderService?.getUserOrders(user?.id, filters);
        console.log('[OrderHistory] Orders fetched:', data?.length);
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err?.message || 'Failed to load orders. Please try again.');
    } finally {
      console.log('[OrderHistory] loadOrders finished, setting loading=false');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      // Calculate stats from fetched orders
      if (orders.length > 0) {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        
        setStats({
          totalOrders,
          totalSpent,
          pendingOrders,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
        });
      } else {
        const statsData = await orderService?.getOrderStats(user?.id);
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDownloadInvoice = async (order) => {
    try {
      generateInvoice(order);
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert(err?.message || 'Failed to generate invoice');
    }
  };

  const handleDownloadReceipt = async (order) => {
    try {
      generateReceipt(order);
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert(err?.message || 'Failed to generate receipt');
    }
  };

  const handleReorder = (order) => {
    // Navigate to cart with items from this order
    console.log('Reorder items:', order?.items);
    // Implementation would add items to cart
    alert('Reorder functionality will add items to your cart');
  };

  const handleContactSupport = (order) => {
    // Navigate to support with order context
    console.log('Contact support for order:', order?.orderNumber);
    alert(`Contact support about order ${order?.orderNumber}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadOrders} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" />
      <main className="lg:ml-sidebar pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Order History</h1>
            <p className="text-muted-foreground">View and manage your furniture orders</p>
          </div>

          {/* Order Statistics */}
          {stats && <OrderStats stats={stats} />}

          {/* Filters */}
          <OrderFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Orders List */}
          {filteredOrders?.length === 0 ? (
            <EmptyOrders 
              hasFilters={filters?.status !== 'all' || filters?.search || filters?.startDate}
              onClearFilters={() => setFilters({ status: 'all', search: '', startDate: null, endDate: null })}
            />
          ) : (
            <div className="space-y-4">
              {filteredOrders?.map(order => (
                <OrderCard
                  key={order?.id}
                  order={order}
                  onDownloadInvoice={handleDownloadInvoice}
                  onDownloadReceipt={handleDownloadReceipt}
                  onReorder={handleReorder}
                  onContactSupport={handleContactSupport}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}