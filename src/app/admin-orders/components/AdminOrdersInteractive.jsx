'use client';

import { useState, useEffect, Fragment } from 'react';
import { orderService } from '@/services/order.service';
import Icon from '@/components/ui/AppIcon';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800'
};

const paymentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function AdminOrdersInteractive() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.customer.fullName.toLowerCase().includes(search) ||
        order.customer.email.toLowerCase().includes(search)
      );
    }

    setFilteredOrders(filtered);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Icon name="ArrowPathIcon" size={40} className="text-primary" />
          </div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">All Customer Orders</h1>
        <p className="text-muted-foreground">Manage and track all orders from customers</p>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Icon 
              name="MagnifyingGlassIcon" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'processing' || o.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Icon name="ShoppingBagIcon" size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Payment</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <Fragment key={order.id}>
                    <tr className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{order.orderNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{order.customer.fullName}</p>
                          <p className="text-muted-foreground text-xs">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleOrderExpand(order.id)}
                          className="text-primary hover:text-primary-foreground transition-colors"
                          aria-label="Toggle order details"
                        >
                          <Icon 
                            name={expandedOrderId === order.id ? "ChevronUpIcon" : "ChevronDownIcon"} 
                            size={20} 
                          />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-muted">
                          <div className="space-y-4">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-start bg-background p-3 rounded border border-border">
                                    <div className="flex-1">
                                      <p className="font-semibold text-foreground text-sm">{item.name}</p>
                                      <p className="text-muted-foreground text-xs">
                                        {item.brand} • SKU: {item.sku} • Qty: {item.quantity}
                                      </p>
                                      {item.variantName && (
                                        <p className="text-muted-foreground text-xs">Variant: {item.variantName}</p>
                                      )}
                                    </div>
                                    <p className="font-semibold text-foreground text-sm ml-4">
                                      {formatCurrency(item.total)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-background p-3 rounded border border-border">
                                <p className="text-muted-foreground text-xs mb-1">Subtotal</p>
                                <p className="font-semibold text-foreground">{formatCurrency(order.subtotal)}</p>
                              </div>
                              <div className="bg-background p-3 rounded border border-border">
                                <p className="text-muted-foreground text-xs mb-1">Tax</p>
                                <p className="font-semibold text-foreground">{formatCurrency(order.taxAmount)}</p>
                              </div>
                              <div className="bg-background p-3 rounded border border-border">
                                <p className="text-muted-foreground text-xs mb-1">Shipping</p>
                                <p className="font-semibold text-foreground">{formatCurrency(order.shippingAmount)}</p>
                              </div>
                              <div className="bg-background p-3 rounded border border-border">
                                <p className="text-muted-foreground text-xs mb-1">Discount</p>
                                <p className="font-semibold text-foreground">-{formatCurrency(order.discountAmount)}</p>
                              </div>
                            </div>
                            {/* Shipping Address */}
                            {order.shippingAddress && (
                              <div className="bg-background p-3 rounded border border-border">
                                <p className="font-semibold text-foreground text-sm mb-2">Shipping Address</p>
                                <p className="text-muted-foreground text-xs">
                                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                  {order.shippingAddress.addressLine1}<br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                                  {order.shippingAddress.country}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
