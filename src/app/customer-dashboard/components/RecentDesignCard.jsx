import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function RecentDesignCard({ design, onContinue, onShare }) {
  return (
    <div className="bg-surface rounded-lg shadow-card border border-border overflow-hidden group hover:shadow-elevated transition-smooth">
      <div className="relative h-48 overflow-hidden bg-muted">
        {design?.thumbnail ? (
          <AppImage
            src={design.thumbnail}
            alt={design?.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="PhotoIcon" size={48} variant="outline" className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <p className="font-body text-xs text-foreground">{design?.date}</p>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-heading font-semibold text-foreground mb-1">
          {design?.name}
        </h4>
        <p className="font-body text-sm text-muted-foreground mb-4">
          {design?.itemCount} items • {design?.roomType}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onContinue(design?.id)}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast flex items-center justify-center gap-2"
          >
            <Icon name="PencilIcon" size={16} variant="outline" />
            Continue
          </button>
          <button
            onClick={() => onShare(design?.id)}
            className="bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-fast"
            aria-label="Share design"
          >
            <Icon name="ShareIcon" size={16} variant="outline" />
          </button>
        </div>
      </div>
    </div>
  );
}

RecentDesignCard.propTypes = {
  design: PropTypes?.shape({
    id: PropTypes?.oneOfType([PropTypes?.number, PropTypes?.string])?.isRequired,
    name: PropTypes?.string?.isRequired,
    thumbnail: PropTypes?.string, // Can be null if render not generated yet
    alt: PropTypes?.string?.isRequired,
    date: PropTypes?.string?.isRequired,
    itemCount: PropTypes?.number?.isRequired,
    roomType: PropTypes?.string?.isRequired,
    is_public: PropTypes?.bool,
    share_token: PropTypes?.string,
  })?.isRequired,
  onContinue: PropTypes?.func?.isRequired,
  onShare: PropTypes?.func?.isRequired,
};