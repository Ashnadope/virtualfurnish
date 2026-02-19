'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function ContinueDesignModal({ isOpen, onContinue, onStartNew, design }) {
  if (!isOpen || !design) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="PencilSquareIcon" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-xl text-foreground">
                Continue Previous Design?
              </h3>
              <p className="font-body text-sm text-muted mt-1">
                You have an unfinished room design. Would you like to continue or start fresh?
              </p>
            </div>
          </div>
        </div>

        {/* Body - Design Preview */}
        <div className="p-6">
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preview Image */}
              <div className="relative aspect-video bg-muted">
                {design.thumbnail ? (
                  <AppImage
                    src={design.thumbnail}
                    alt={design.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon 
                      name="PhotoIcon" 
                      size={48} 
                      variant="outline" 
                      className="text-muted" 
                    />
                  </div>
                )}
              </div>

              {/* Design Info */}
              <div className="p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-semibold text-lg text-foreground mb-2">
                    {design.name}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="ClockIcon" size={16} className="text-muted" />
                      <span className="font-body text-muted">
                        Last edited {formatDate(design.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="CubeIcon" size={16} className="text-muted" />
                      <span className="font-body text-muted">
                        {design.furnitureCount} {design.furnitureCount === 1 ? 'item' : 'items'} placed
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0" />
                    <p className="font-body text-xs text-foreground">
                      Your design is auto-saved and ready to resume
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 border-t border-border bg-background/50">
          <button
            onClick={onStartNew}
            className="flex-1 px-6 py-3 border-2 border-border text-foreground rounded-lg font-body font-medium hover:bg-surface transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="PlusCircleIcon" size={20} />
            Start New Design
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-body font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="ArrowRightCircleIcon" size={20} />
            Continue Design
          </button>
        </div>
      </div>
    </div>
  );
}

ContinueDesignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onContinue: PropTypes.func.isRequired,
  onStartNew: PropTypes.func.isRequired,
  design: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    updated_at: PropTypes.string.isRequired,
    furnitureCount: PropTypes.number.isRequired
  })
};
