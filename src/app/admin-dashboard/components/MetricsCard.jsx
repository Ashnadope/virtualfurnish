import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function MetricsCard({ title, value, change, changeType, icon, iconBg }) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-body text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="font-heading text-3xl font-bold text-foreground mb-2">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              <Icon 
                name={isPositive ? 'ArrowUpIcon' : isNegative ? 'ArrowDownIcon' : 'MinusIcon'} 
                size={16} 
                variant="solid"
                className={isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'}
              />
              <span className={`font-body text-sm font-medium ${
                isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'
              }`}>
                {change}
              </span>
              <span className="font-body text-sm text-muted-foreground ml-1">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon name={icon} size={24} variant="solid" className="text-white" />
        </div>
      </div>
    </div>
  );
}

MetricsCard.propTypes = {
  title: PropTypes?.string?.isRequired,
  value: PropTypes?.string?.isRequired,
  change: PropTypes?.string,
  changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes?.string?.isRequired,
  iconBg: PropTypes?.string?.isRequired,
};