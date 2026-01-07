import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function OrderStatusCard({ order }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success/10 text-success border-success/20';
      case 'In Transit':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Processing':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return 'CheckCircleIcon';
      case 'In Transit':
        return 'TruckIcon';
      case 'Processing':
        return 'ClockIcon';
      default:
        return 'InformationCircleIcon';
    }
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
          <span className="font-body text-xs font-medium">{order?.status}</span>
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
      <button className="w-full bg-muted text-foreground px-4 py-2 rounded-md font-body text-sm font-medium hover:bg-muted/80 transition-fast flex items-center justify-center gap-2">
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
    status: PropTypes?.oneOf(['Delivered', 'In Transit', 'Processing'])?.isRequired,
    orderDate: PropTypes?.string?.isRequired,
    estimatedDelivery: PropTypes?.string,
    totalAmount: PropTypes?.number?.isRequired,
  })?.isRequired,
};