'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function ActionTile({ tile }) {
  return (
    <Link
      href={tile?.href || '#'}
      className={`
        relative overflow-hidden rounded-lg p-4 sm:p-6 transition-all duration-300 
        hover:scale-105 active:scale-100 hover:shadow-xl touch-manipulation
        ${tile?.bgColor || 'bg-gradient-to-br from-primary to-primary/80'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
            <Icon name={tile?.icon} size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-heading font-semibold text-white mb-2">
            {tile?.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 font-body">
            {tile?.description}
          </p>
        </div>
        
        <div className="mt-auto flex items-center text-white font-body text-xs sm:text-sm">
          <span className="font-medium">Get Started</span>
          <Icon name="ArrowRightIcon" size={14} className="sm:w-4 sm:h-4 ml-2" />
        </div>
      </div>

      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white rounded-full" />
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 border-2 border-white rounded-full" />
      </div>
    </Link>
  );
}

ActionTile.propTypes = {
  tile: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    title: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    icon: PropTypes?.string?.isRequired,
    href: PropTypes?.string?.isRequired,
    bgColor: PropTypes?.string
  })?.isRequired
};