import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function ActionTile({ title, description, icon, href, bgColor }) {
  return (
    <Link
      href={href}
      className={`${bgColor} rounded-lg shadow-card p-6 border border-border hover:shadow-elevated transition-smooth group`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth">
          <Icon name={icon} size={28} variant="outline" className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg font-semibold text-white mb-2">
            {title}
          </h3>
          <p className="font-body text-sm text-white/90">
            {description}
          </p>
        </div>
        <Icon name="ChevronRightIcon" size={24} variant="outline" className="text-white/70 group-hover:translate-x-1 transition-smooth" />
      </div>
    </Link>
  );
}

ActionTile.propTypes = {
  title: PropTypes?.string?.isRequired,
  description: PropTypes?.string?.isRequired,
  icon: PropTypes?.string?.isRequired,
  href: PropTypes?.string?.isRequired,
  bgColor: PropTypes?.string?.isRequired,
};