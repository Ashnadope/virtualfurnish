'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import AppImage from '../../../components/ui/AppImage';

export default function OrderCard({ 
  order, 
  isHighlighted = false,
  initialExpanded = false,
  onDownloadReceipt,
  onContactSupport,
  onCancelOrder
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [cancelling, setCancelling] = useState(false);

  const CANCELLABLE_STATUSES = ['pending', 'processing', 'packing'];
  const canCancel = CANCELLABLE_STATUSES.includes(order?.status?.toLowerCase());
  const canContinuePayment = order?.status?.toLowerCase() === 'pending' && 
    ['pending', 'failed'].includes(order?.paymentStatus?.toLowerCase());

  const isPaymentConfirmed = ['paid', 'completed', 'succeeded'].includes(order?.paymentStatus?.toLowerCase());

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancelOrder?.(order);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors?.[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalItems = typeof order?.totalItems === 'number'
    ? order.totalItems
    : (order?.items || []).reduce((sum, item) => sum + (parseInt(item?.quantity || 0, 10) || 0), 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
      {/* Order Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="max-w-[11rem] truncate text-sm font-semibold text-gray-900 sm:max-w-none sm:text-lg" title={`Order #${order?.orderNumber}`}>
                Order #{order?.orderNumber}
              </h3>
              <span className={`px-2 py-1 rounded-full text-[11px] font-medium border sm:px-3 sm:text-xs ${getStatusColor(order?.status)}`}>
                {order?.status?.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Placed on {formatDate(order?.createdAt)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">
              {formatCurrency(order?.totalAmount)}
            </p>
            <p className="mt-1 text-[11px] text-gray-600 sm:text-xs">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3 sm:pb-2">
          {order?.items?.slice(0, 4)?.map((item, index) => (
            <div 
              key={item?.id || index}
              className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden sm:w-20 sm:h-20"
            >
              <AppImage
                src={item?.imageUrl || '/assets/images/no_image.png'}
                alt={item?.name || 'Product image'}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {order?.items?.length > 4 && (
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center sm:w-20 sm:h-20">
              <span className="text-xs font-medium text-gray-600 sm:text-sm">
                +{order?.items?.length - 4}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors sm:px-4 sm:py-2 sm:text-sm"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
          <button
            onClick={() => onDownloadReceipt?.(order)}
            disabled={!isPaymentConfirmed}
            title={!isPaymentConfirmed ? 'Receipt available once payment is confirmed' : 'Download Receipt'}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:px-4 sm:py-2 sm:text-sm"
          >
            Receipt
          </button>
          <Link
            href={`/support?order=${encodeURIComponent(order?.orderNumber)}`}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors sm:px-4 sm:py-2 sm:text-sm"
          >
            Contact Support
          </Link>
          {canContinuePayment && (
            <Link
              href={`/checkout/pay?orderId=${order?.id}`}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors sm:px-4 sm:py-2 sm:text-sm"
            >
              Continue to Payment
            </Link>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              {cancelling && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Order Items</h4>
            {order?.items?.map((item, index) => (
              <div 
                key={item?.id || index}
                className="flex items-center gap-4 bg-white p-3 rounded-md"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <AppImage
                    src={item?.imageUrl || '/assets/images/no_image.png'}
                    alt={item?.name || 'Product image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item?.name}</p>
                  {item?.variantName && (
                    <p className="text-sm text-gray-600">{item?.variantName}</p>
                  )}
                  {item?.brand && (
                    <p className="text-xs text-gray-500">{item?.brand}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-600">Qty: {item?.quantity}</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item?.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 bg-white p-4 rounded-md space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order?.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">{formatCurrency(order?.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{formatCurrency(order?.shippingAmount)}</span>
            </div>
            {order?.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">-{formatCurrency(order?.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(order?.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order?.shippingAddress && (
            <div className="mt-4 bg-white p-4 rounded-md">
              <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
              <div className="text-sm text-gray-600">
                <p>{order?.shippingAddress?.first_name} {order?.shippingAddress?.last_name}</p>
                <p>{order?.shippingAddress?.address_line_1}</p>
                {order?.shippingAddress?.address_line_2 && (
                  <p>{order?.shippingAddress?.address_line_2}</p>
                )}
                {order?.shippingAddress?.barangay && (
                  <p>Brgy. {order?.shippingAddress?.barangay}</p>
                )}
                <p>
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.postal_code}
                </p>
                <p>{order?.shippingAddress?.country || 'Philippines'}</p>
                {order?.shippingAddress?.phone && (
                  <p className="mt-1">Phone: {order?.shippingAddress?.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="mt-4 bg-white p-4 rounded-md">
            <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="text-gray-900 font-medium">
                  {order?.paymentMethod?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  order?.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order?.paymentStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mt-4 bg-white p-4 rounded-md">
            <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Order Placed</p>
                  <p className="text-xs text-gray-500">{formatDate(order?.createdAt)}</p>
                </div>
              </div>
              {order?.status !== 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Processing</p>
                    <p className="text-xs text-gray-500">Order confirmed and being prepared</p>
                  </div>
                </div>
              )}
              {(order?.status === 'shipped' || order?.status === 'delivered') && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Shipped</p>
                    <p className="text-xs text-gray-500">Out for delivery</p>
                  </div>
                </div>
              )}
              {order?.status === 'delivered' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Delivered</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order?.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

OrderCard.propTypes = {
  order: PropTypes?.shape({
    id: PropTypes?.string,
    orderNumber: PropTypes?.string,
    status: PropTypes?.string,
    paymentStatus: PropTypes?.string,
    paymentMethod: PropTypes?.string,
    subtotal: PropTypes?.number,
    taxAmount: PropTypes?.number,
    shippingAmount: PropTypes?.number,
    discountAmount: PropTypes?.number,
    totalAmount: PropTypes?.number,
    createdAt: PropTypes?.string,
    updatedAt: PropTypes?.string,
    shippingAddress: PropTypes?.object,
    totalItems: PropTypes?.number,
    items: PropTypes?.arrayOf(PropTypes?.shape({
      id: PropTypes?.string,
      name: PropTypes?.string,
      brand: PropTypes?.string,
      variantName: PropTypes?.string,
      quantity: PropTypes?.number,
      price: PropTypes?.number,
      total: PropTypes?.number,
      imageUrl: PropTypes?.string
    }))
  })?.isRequired,
  isHighlighted: PropTypes?.bool,
  initialExpanded: PropTypes?.bool,
  onDownloadReceipt: PropTypes?.func,
  onContactSupport: PropTypes?.func,
  onCancelOrder: PropTypes?.func,
};