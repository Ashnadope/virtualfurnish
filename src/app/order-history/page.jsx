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
  const { user, loading: authLoading, isHydrated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
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
    let isMounted = true;

    // Wait for the very first auth check to complete.
    // Do NOT depend on authLoading — it flips on every token refresh
    // (e.g. tab focus) which would re-run this effect and show the
    // full-page spinner on already-loaded data.
    if (!isHydrated) {
      return;
    }

    if (!user?.id) {
      router.push('/login');
      return;
    }

    const loadOrders = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        setError('');
        const data = await orderService?.getUserOrders(user?.id);
        
        if (isMounted) {
          setOrders(data || []);
          
          // Calculate stats from fetched orders
          if (data && data.length > 0) {
            const totalOrders = data.length;
            const totalSpent = data.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
            const pendingOrders = data.filter(o => o.status === 'Pending' || o.status === 'pending').length;
            
            setStats({
              totalOrders,
              totalSpent,
              pendingOrders,
              averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
            });
          } else {
            // If no orders, try to get stats from service
            try {
              const statsData = await orderService?.getOrderStats(user?.id);
              if (isMounted) {
                setStats(statsData);
              }
            } catch (err) {
              console.error('Error loading stats:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to load orders. Please try again.');
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isHydrated, router, retryKey]);

  const handleRetry = () => {
    setError('');
    setRetryKey(prev => prev + 1);
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
    return <ErrorMessage message={error} onRetry={handleRetry} />;
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