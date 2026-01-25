'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { generateInvoice, generateReceipt } from '../../utils/invoiceGenerator';
import { generateMockOrders, formatOrderForOrderCard } from '../../utils/mockData';
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
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: null,
    endDate: null
  });

  // Load orders on mount
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user?.id) {
      router.push('/login');
      setLoading(false);
      return;
    }

    loadOrders();
    loadStats();
  }, [user?.id, authLoading, router]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const loadOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch real orders from Supabase
      if (user?.id) {
        // Otherwise fetch from Supabase
        const data = await orderService?.getUserOrders(user?.id, filters);
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err?.message || 'Failed to load orders. Please try again.');
    } finally {
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

  const applyFilters = () => {
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

    setFilteredOrders(filtered);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your furniture orders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
}