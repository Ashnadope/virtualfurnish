'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function SaveDesignModal({ isOpen, onClose, onSave, currentName = '', currentDescription = '' }) {
  const [name, setName] = useState(currentName || '');
  const [description, setDescription] = useState(currentDescription || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a design name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="DocumentCheckIcon" size={24} className="text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-foreground">
              Save Room Design
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {/* Body - Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                Design Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Modern Living Room, Cozy Bedroom"
                maxLength={100}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg font-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                autoFocus
              />
              <p className="font-body text-xs text-muted mt-1">
                {name.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                Description <span className="font-body text-xs text-muted">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about your design choices, style, or color theme..."
                maxLength={500}
                rows={4}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg font-body text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
              />
              <p className="font-body text-xs text-muted mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-2">
              <Icon 
                name="InformationCircleIcon" 
                size={20} 
                className="text-primary flex-shrink-0 mt-0.5" 
              />
              <p className="font-body text-xs text-foreground">
                Your design is automatically saved as you work. This allows you to add a custom name and description.
              </p>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="flex gap-3 p-6 border-t border-border bg-background/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-6 py-2 border border-border text-foreground rounded-lg font-body font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 px-6 py-2 bg-primary text-white rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="CheckIcon" size={20} />
                  Save Design
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

SaveDesignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentName: PropTypes.string,
  currentDescription: PropTypes.string
};
