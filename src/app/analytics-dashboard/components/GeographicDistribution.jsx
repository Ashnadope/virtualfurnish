import PropTypes from 'prop-types';

export default function GeographicDistribution({ regions }) {
  const maxValue = Math.max(...regions?.map(r => r?.orders));

  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Geographic Sales Distribution</h3>
      <div className="space-y-4">
        {regions?.map((region) => {
          const percentage = (region?.orders / maxValue) * 100;
          
          return (
            <div key={region?.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm text-foreground font-medium">{region?.name}</span>
                <span className="font-body text-sm text-muted-foreground">{region?.orders} orders</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-body text-xs text-muted-foreground">Revenue: ₱{region?.revenue}</span>
                <span className="font-body text-xs text-muted-foreground">{region?.percentage}% of total</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title="Philippines Sales Distribution Map"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=14.5995,120.9842&z=6&output=embed"
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

GeographicDistribution.propTypes = {
  regions: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      orders: PropTypes?.number?.isRequired,
      revenue: PropTypes?.string?.isRequired,
      percentage: PropTypes?.string?.isRequired
    })
  )?.isRequired
};