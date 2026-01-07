import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function QuickActionTile({ title, description, icon, iconBg, href }) {
  return (
    <Link 
      href={href}
      className="bg-surface rounded-lg p-6 border border-border shadow-card hover:shadow-elevated transition-smooth group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg} group-hover:scale-110 transition-smooth`}>
          <Icon name={icon} size={24} variant="solid" className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-heading text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-fast">
            {title}
          </h4>
          <p className="font-body text-sm text-muted-foreground">{description}</p>
        </div>
        <Icon name="ChevronRightIcon" size={20} variant="outline" className="text-muted-foreground group-hover:text-primary transition-fast" />
      </div>
    </Link>
  );
}

QuickActionTile.propTypes = {
  title: PropTypes?.string?.isRequired,
  description: PropTypes?.string?.isRequired,
  icon: PropTypes?.string?.isRequired,
  iconBg: PropTypes?.string?.isRequired,
  href: PropTypes?.string?.isRequired,
};