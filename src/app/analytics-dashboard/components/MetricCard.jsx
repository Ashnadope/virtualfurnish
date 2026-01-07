import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function MetricCard({ title, value, change, changeType, icon, currency }) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="font-body text-sm text-muted-foreground mb-1">{title}</p>
          <p className="font-heading text-2xl font-bold text-foreground">
            {currency && '₱'}
            {value}
          </p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name={icon} size={24} variant="solid" className="text-primary" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            isPositive ? 'bg-success/10 text-success' : isNegative ?'bg-error/10 text-error': 'bg-muted text-muted-foreground'
          }`}>
            <Icon 
              name={isPositive ? 'ArrowUpIcon' : isNegative ? 'ArrowDownIcon' : 'MinusIcon'} 
              size={16} 
              variant="solid" 
            />
            <span className="font-body text-sm font-medium">{change}</span>
          </div>
          <span className="font-body text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  title: PropTypes?.string?.isRequired,
  value: PropTypes?.string?.isRequired,
  change: PropTypes?.string,
  changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes?.string?.isRequired,
  currency: PropTypes?.bool
};