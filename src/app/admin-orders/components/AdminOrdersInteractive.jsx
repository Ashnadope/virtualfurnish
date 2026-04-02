'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
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
  cancelled: 'bg-red-100 text-red-800',
  refund_pending: 'bg-orange-100 text-orange-800',
  refunded: 'bg-teal-100 text-teal-800'
};

const paymentStatusLabel = {
  pending: 'Pending',
  succeeded: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refund_pending: 'Refund Pending',
  refunded: 'Refunded'
};

export default function AdminOrdersInteractive({ initialOrders = [] }) {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(() => searchParams?.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusDraft, setStatusDraft] = useState({});
  const [markingRefundedId, setMarkingRefundedId] = useState(null);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter]);

  // Auto-expand when arriving from the dashboard via ?q= and it filters to one order
  useEffect(() => {
    if (!searchParams?.get('q') || filteredOrders.length !== 1) return;
    const order = filteredOrders[0];
    setExpandedOrderId(order.id);
    setStatusDraft(prev => ({ ...prev, [order.id]: order.status }));
  }, [filteredOrders]);

  const fetchAllOrders = async () => {
    try {
      setError(null);
      setLoading(true);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timed out. Please try again.')), 15000);
      });
      const data = await Promise.race([orderService.getAllOrders(), timeoutPromise]);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err?.message || 'Failed to load orders. Please try again.');
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
        (order?.orderNumber || '').toLowerCase().includes(search) ||
        (order?.customer?.fullName || '').toLowerCase().includes(search) ||
        (order?.customer?.email || '').toLowerCase().includes(search)
      );
    }

    setFilteredOrders(filtered);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    // Pre-load the draft status when expanding
    if (expandedOrderId !== orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) setStatusDraft(prev => ({ ...prev, [orderId]: order.status }));
    }
  };

  const handleMarkRefunded = async (orderId) => {
    setMarkingRefundedId(orderId);
    try {
      await orderService.markOrderRefunded(orderId);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, paymentStatus: 'refunded' } : o
      ));
    } catch (err) {
      console.error('Failed to mark as refunded:', err);
      alert(err?.message || 'Failed to update. Please try again.');
    } finally {
      setMarkingRefundedId(null);
    }
  };

  const handleStatusUpdate = async (orderId) => {
    const newStatus = statusDraft[orderId];
    const order = orders.find(o => o.id === orderId);
    if (!newStatus || !order || newStatus === order.status) return;

    setUpdatingOrderId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      // Optimistically update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">All Customer Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders from customers</p>
        </div>
        <button
          onClick={fetchAllOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-md text-sm text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <Icon name="ArrowPathIcon" size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
                          {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
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
                            {/* Refund Action — only when GCash refund is awaiting manual confirmation */}
                            {order.paymentStatus === 'refund_pending' && (() => {
                              const gcashTxn = order.transactions?.find(
                                t => t.gateway === 'gcash' && t.status !== 'refund'
                              );
                              const gcashNumber = gcashTxn?.gcashNumber || order.shippingAddress?.phone;
                              return (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="font-semibold text-orange-900 text-sm mb-1">⚠ Refund Pending — Action Required</p>
                                      <p className="text-orange-700 text-xs">
                                        This order was cancelled and is awaiting a manual GCash refund.
                                        Send <span className="font-bold">{formatCurrency(order.totalAmount)}</span> to the customer's GCash number, then click <strong>Mark as Refunded</strong> to confirm.
                                      </p>
                                      {gcashNumber && (
                                        <p className="mt-2 text-orange-800 text-xs">
                                          {gcashTxn?.gcashNumber
                                            ? <>GCash number used for payment: <span className="font-bold text-sm">{gcashNumber}</span></>
                                            : <>Shipping phone (GCash number not recorded): <span className="font-bold">{gcashNumber}</span></>
                                          }
                                        </p>
                                      )}
                                      {gcashTxn?.gcashReferenceId && (
                                        <p className="mt-1 text-orange-700 text-xs">Reference ID: <span className="font-mono">{gcashTxn.gcashReferenceId}</span></p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleMarkRefunded(order.id)}
                                      disabled={markingRefundedId === order.id}
                                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {markingRefundedId === order.id ? (
                                        <>
                                          <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                                          Confirming…
                                        </>
                                      ) : (
                                        <>
                                          <Icon name="CheckCircleIcon" size={14} />
                                          Mark as Refunded
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Status Update */}
                            <div className="bg-background rounded-lg border border-border p-4">
                              <h4 className="font-semibold text-foreground mb-3 text-sm">Update Order Status</h4>
                              <div className="flex items-center gap-3">
                                <select
                                  value={statusDraft[order.id] ?? order.status}
                                  onChange={(e) => setStatusDraft(prev => ({ ...prev, [order.id]: e.target.value }))}
                                  className="px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="disputed">Disputed</option>
                                </select>
                                <button
                                  onClick={() => handleStatusUpdate(order.id)}
                                  disabled={
                                    updatingOrderId === order.id ||
                                    (statusDraft[order.id] ?? order.status) === order.status
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {updatingOrderId === order.id ? (
                                    <>
                                      <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Icon name="CheckIcon" size={14} />
                                      Save Status
                                    </>
                                  )}
                                </button>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || statusColors.pending}`}>
                                  Current: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>

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
                                <div className="text-muted-foreground text-xs space-y-0.5">
                                  {(order.shippingAddress.first_name || order.shippingAddress.last_name) && (
                                    <p>{[order.shippingAddress.first_name, order.shippingAddress.last_name].filter(Boolean).join(' ')}</p>
                                  )}
                                  {order.shippingAddress.address_line_1 && (
                                    <p>{order.shippingAddress.address_line_1}</p>
                                  )}
                                  {order.shippingAddress.address_line_2 && (
                                    <p>{order.shippingAddress.address_line_2}</p>
                                  )}
                                  {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.postal_code) && (
                                    <p>{[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postal_code].filter(Boolean).join(', ')}</p>
                                  )}
                                  {order.shippingAddress.country && (
                                    <p>{order.shippingAddress.country}</p>
                                  )}
                                  {order.shippingAddress.phone && (
                                    <p className="mt-1">{order.shippingAddress.phone}</p>
                                  )}
                                </div>
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
