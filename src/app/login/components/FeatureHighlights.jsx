import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function FeatureHighlights({ features }) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-lg text-foreground">
        Why Choose VirtualFurnish?
      </h3>
      <div className="space-y-3">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon name={feature?.icon} size={20} variant="outline" className="text-accent" />
            </div>
            <div>
              <h4 className="font-body font-semibold text-sm text-foreground mb-1">
                {feature?.title}
              </h4>
              <p className="font-body text-sm text-muted-foreground">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

FeatureHighlights.propTypes = {
  features: PropTypes?.arrayOf(
    PropTypes?.shape({
      icon: PropTypes?.string?.isRequired,
      title: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired
    })
  )?.isRequired
};