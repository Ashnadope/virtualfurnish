'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ShareDesignModal({ isOpen, onClose, shareUrl, designName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-heading font-semibold text-xl text-foreground">
            Share Design
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <p className="font-body text-foreground mb-2">
              Share <span className="font-semibold">{designName}</span> with others
            </p>
            <p className="font-body text-sm text-muted">
              Anyone with this link can view your room design
            </p>
          </div>

          {/* Share Link Display */}
          <div className="mb-6">
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-primary text-white rounded-lg font-body text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Icon 
                  name={copied ? "CheckIcon" : "ClipboardDocumentIcon"} 
                  size={20} 
                />
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
            <Icon 
              name="InformationCircleIcon" 
              size={20} 
              className="text-primary flex-shrink-0 mt-0.5" 
            />
            <p className="font-body text-sm text-foreground">
              This design is now public. Anyone with the link can view your room layout and furniture placement.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-background/50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border text-foreground rounded-lg font-body font-medium hover:bg-surface transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

ShareDesignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  shareUrl: PropTypes.string.isRequired,
  designName: PropTypes.string.isRequired
};
