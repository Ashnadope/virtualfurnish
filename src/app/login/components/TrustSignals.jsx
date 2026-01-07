import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function TrustSignals({ signals }) {
  return (
    <div className="pt-6 border-t border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {signals?.map((signal, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Icon name={signal?.icon} size={24} variant="solid" className="text-success" />
            </div>
            <p className="font-body text-xs text-muted-foreground">
              {signal?.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

TrustSignals.propTypes = {
  signals: PropTypes?.arrayOf(
    PropTypes?.shape({
      icon: PropTypes?.string?.isRequired,
      label: PropTypes?.string?.isRequired
    })
  )?.isRequired
};