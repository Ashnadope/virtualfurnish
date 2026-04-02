'use client';

import { useState, useMemo } from 'react';
import { generateReceipt } from '../../../utils/invoiceGenerator';
import { orderService } from '@/services/order.service';
import OrderCard from './OrderCard';
import OrderFilters from './OrderFilters';
import OrderStats from './OrderStats';
import EmptyOrders from './EmptyOrders';

export default function OrderHistoryInteractive({ initialOrders = [], initialStats = null, initialSearch = '', initialFocusedOrderId = '' }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filters, setFilters] = useState({
    status: 'all',
    search: initialSearch || '',
    startDate: null,
    endDate: null
  });

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(o => o.status?.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber?.toLowerCase().includes(s) ||
        o.items?.some(item => item.name?.toLowerCase().includes(s))
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.endDate));
    }

    return filtered;
  }, [orders, filters]);

  const stats = useMemo(() => {
    if (initialStats) return initialStats;
    if (!orders.length) return null;
    return {
      total: orders.length,
      delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
      shipped: orders.filter(o => o.status?.toLowerCase() === 'shipped').length,
      processing: orders.filter(o => o.status?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'pending').length,
      totalSpent: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0),
    };
  }, [orders, initialStats]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDownloadReceipt = (order) => {
    try {
      generateReceipt(order);
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert(err?.message || 'Failed to generate receipt');
    }
  };

  const handleContactSupport = (order) => {
    alert(`Contact support about order ${order?.orderNumber}`);
  };

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Cancel order #${order?.orderNumber}? This action cannot be undone.\n\nSince payment was already collected, a refund will be issued automatically.`
    );
    if (!confirmed) return;

    try {
      const { data, message } = await orderService.cancelOrder(order.id);
      // Optimistic local update — flip status immediately
      setOrders(prev =>
        prev.map(o => o.id === order.id ? {
          ...o,
          status: data?.status || 'cancelled',
          paymentStatus: data?.payment_status || o.paymentStatus,
        } : o)
      );
      alert(message || 'Order cancelled successfully.');
    } catch (err) {
      alert(err?.message || 'Failed to cancel order. Please try again.');
    }
  };

  return (
    <>
      {stats && <OrderStats stats={stats} />}

      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />

      {filteredOrders.length === 0 ? (
        <EmptyOrders
          hasFilters={filters.status !== 'all' || filters.search || filters.startDate}
          onClearFilters={() => setFilters({ status: 'all', search: '', startDate: null, endDate: null })}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isHighlighted={Boolean(initialFocusedOrderId) && order.id === initialFocusedOrderId}
              initialExpanded={Boolean(initialFocusedOrderId) && order.id === initialFocusedOrderId}
              onDownloadReceipt={handleDownloadReceipt}
              onContactSupport={handleContactSupport}
              onCancelOrder={handleCancelOrder}
            />
          ))}
        </div>
      )}
    </>
  );
}
