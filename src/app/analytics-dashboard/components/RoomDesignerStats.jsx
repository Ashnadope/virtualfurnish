import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function RoomDesignerStats({ stats }) {
  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Room Designer Analytics</h3>
        <Icon name="CubeIcon" size={24} variant="solid" className="text-primary" />
      </div>
      <div className="space-y-4">
        {stats?.map((stat) => (
          <div key={stat?.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
            <div className="flex-1">
              <p className="font-body text-sm text-foreground font-medium mb-1">{stat?.label}</p>
              <p className="font-body text-xs text-muted-foreground">{stat?.description}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-bold text-foreground">{stat?.value}</p>
              {stat?.change && (
                <p className={`font-body text-xs ${
                  stat?.changeType === 'positive' ? 'text-success' : 
                  stat?.changeType === 'negative'? 'text-error' : 'text-muted-foreground'
                }`}>
                  {stat?.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

RoomDesignerStats.propTypes = {
  stats: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      label: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      value: PropTypes?.string?.isRequired,
      change: PropTypes?.string,
      changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral'])
    })
  )?.isRequired
};