'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function OrderStatusCard({ order }) {
  const router = useRouter();

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      packing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'ClockIcon',
      processing: 'CogIcon',
      packing: 'ArchiveBoxIcon',
      shipped: 'TruckIcon',
      delivered: 'CheckCircleIcon',
      cancelled: 'XCircleIcon',
    };
    return icons[status?.toLowerCase()] || 'InformationCircleIcon';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      packing: 'Packing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status?.toLowerCase()] || status || 'Unknown';
  };

  return (
    <div className="bg-surface rounded-lg shadow-card border border-border p-4 hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-body text-xs text-muted-foreground mb-1">Order #{order?.orderNumber}</p>
          <h4 className="font-heading font-semibold text-foreground">{order?.productName}</h4>
        </div>
        <div className={`px-3 py-1 rounded-full border ${getStatusColor(order?.status)} flex items-center gap-1.5`}>
          <Icon name={getStatusIcon(order?.status)} size={14} variant="solid" />
          <span className="font-body text-xs font-medium">{getStatusLabel(order?.status)}</span>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="CalendarIcon" size={16} variant="outline" className="text-muted-foreground" />
          <p className="font-body text-muted-foreground">Ordered: {order?.orderDate}</p>
        </div>
        {order?.estimatedDelivery && (
          <div className="flex items-center gap-2 text-sm">
            <Icon name="TruckIcon" size={16} variant="outline" className="text-muted-foreground" />
            <p className="font-body text-muted-foreground">Est. Delivery: {order?.estimatedDelivery}</p>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Icon name="CurrencyDollarIcon" size={16} variant="outline" className="text-muted-foreground" />
          <p className="font-body font-semibold text-foreground">
            ₱{order?.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push('/order-history')}
        className="w-full bg-muted text-foreground px-4 py-2 rounded-md font-body text-sm font-medium hover:bg-muted/80 transition-fast flex items-center justify-center gap-2"
      >
        <Icon name="EyeIcon" size={16} variant="outline" />
        Track Order
      </button>
    </div>
  );
}

OrderStatusCard.propTypes = {
  order: PropTypes?.shape({
    orderNumber: PropTypes?.string?.isRequired,
    productName: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    orderDate: PropTypes?.string?.isRequired,
    estimatedDelivery: PropTypes?.string,
    totalAmount: PropTypes?.number?.isRequired,
  })?.isRequired,
};