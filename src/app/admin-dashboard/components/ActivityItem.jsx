import Link from 'next/link';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ActivityItem({ type, title, description, time, priority, orderNumber, userId, sku }) {
  let href = null;
  if (type === 'order' && orderNumber) href = `/admin-orders?q=${encodeURIComponent(orderNumber)}`;
  else if (type === 'inquiry' && userId) href = `/admin-support?user=${encodeURIComponent(userId)}`;
  else if (type === 'alert' && sku) href = `/product-management?q=${encodeURIComponent(sku)}`;
  const isClickable = !!href;
  const getTypeConfig = () => {
    switch (type) {
      case 'order':
        return { icon: 'ShoppingBagIcon', bg: 'bg-primary', color: 'text-primary' };
      case 'inquiry':
        return { icon: 'ChatBubbleLeftRightIcon', bg: 'bg-accent', color: 'text-accent' };
      case 'alert':
        return { icon: 'ExclamationTriangleIcon', bg: 'bg-warning', color: 'text-warning' };
      case 'system':
        return { icon: 'BellIcon', bg: 'bg-muted', color: 'text-muted-foreground' };
      default:
        return { icon: 'InformationCircleIcon', bg: 'bg-muted', color: 'text-muted-foreground' };
    }
  };

  const config = getTypeConfig();

  const inner = (
    <>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config?.bg}`}>
        <Icon name={config?.icon} size={20} variant="solid" className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h5 className="font-body text-sm font-medium text-foreground">{title}</h5>
          {priority === 'high' && (
            <span className="px-2 py-0.5 bg-error/10 text-error text-xs font-semibold rounded-full whitespace-nowrap">
              High Priority
            </span>
          )}
        </div>
        <p className="font-body text-sm text-muted-foreground mb-1">{description}</p>
        <span className="font-body text-xs text-muted-foreground">{time}</span>
      </div>
      {isClickable && (
        <div className="self-center text-muted-foreground">
          <Icon name="ArrowRightIcon" size={16} variant="outline" />
        </div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <Link
        href={href}
        className="flex items-start gap-4 py-4 border-b border-border last:border-0 hover:bg-muted/40 rounded-md px-2 -mx-2 transition-colors"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      {inner}
    </div>
  );
}

ActivityItem.propTypes = {
  type: PropTypes?.oneOf(['order', 'inquiry', 'alert', 'system'])?.isRequired,
  title: PropTypes?.string?.isRequired,
  description: PropTypes?.string?.isRequired,
  time: PropTypes?.string?.isRequired,
  priority: PropTypes?.oneOf(['high', 'normal']),
  orderNumber: PropTypes?.string,
  userId: PropTypes?.string,
  sku: PropTypes?.string,
};