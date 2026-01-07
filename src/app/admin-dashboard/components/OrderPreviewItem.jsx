import PropTypes from 'prop-types';


export default function OrderPreviewItem({ order }) {
  const getStatusConfig = () => {
    switch (order?.status) {
      case 'pending':
        return { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' };
      case 'processing':
        return { bg: 'bg-primary/10', text: 'text-primary', label: 'Processing' };
      case 'shipped':
        return { bg: 'bg-accent/10', text: 'text-accent', label: 'Shipped' };
      case 'delivered':
        return { bg: 'bg-success/10', text: 'text-success', label: 'Delivered' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-body text-sm font-medium text-foreground">Order #{order?.orderNumber}</h5>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig?.bg} ${statusConfig?.text}`}>
            {statusConfig?.label}
          </span>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-1">{order?.customerName}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{order?.items} items</span>
          <span>₱{order?.total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          <span>{order?.date}</span>
        </div>
      </div>
      <button 
        className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-fast font-body text-sm font-medium"
        aria-label={`Process order ${order?.orderNumber}`}
      >
        Process
      </button>
    </div>
  );
}

OrderPreviewItem.propTypes = {
  order: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    orderNumber: PropTypes?.string?.isRequired,
    customerName: PropTypes?.string?.isRequired,
    items: PropTypes?.number?.isRequired,
    total: PropTypes?.number?.isRequired,
    date: PropTypes?.string?.isRequired,
    status: PropTypes?.oneOf(['pending', 'processing', 'shipped', 'delivered'])?.isRequired,
  })?.isRequired,
};