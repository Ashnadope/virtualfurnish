'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import AppImage from '../../../components/ui/AppImage';

export default function OrderCard({ 
  order, 
  onDownloadInvoice, 
  onDownloadReceipt,
  onReorder,
  onContactSupport
}) {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order?.orderNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order?.status)}`}>
                {order?.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {formatDate(order?.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(order?.totalAmount)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {order?.items?.length} {order?.items?.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {order?.items?.slice(0, 4)?.map((item, index) => (
            <div 
              key={item?.id || index}
              className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden"
            >
              <AppImage
                src={item?.imageUrl || '/assets/images/no_image.png'}
                alt={item?.name || 'Product image'}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {order?.items?.length > 4 && (
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                +{order?.items?.length - 4}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
          <button
            onClick={() => onDownloadInvoice?.(order)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Download Invoice
          </button>
          <button
            onClick={() => onDownloadReceipt?.(order)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Receipt
          </button>
          <button
            onClick={() => onReorder?.(order)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reorder Items
          </button>
          <button
            onClick={() => onContactSupport?.(order)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
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
  onDownloadInvoice: PropTypes?.func,
  onDownloadReceipt: PropTypes?.func,
  onReorder: PropTypes?.func,
  onContactSupport: PropTypes?.func
};