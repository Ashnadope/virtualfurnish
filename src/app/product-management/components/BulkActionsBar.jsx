'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function BulkActionsBar({ selectedCount, onBulkDelete, onBulkStatusChange, onClearSelection }) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-overlay animate-slide-in">
      <div className="bg-surface border border-border rounded-lg shadow-elevated px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-primary" />
          <span className="font-body font-medium text-sm text-foreground">
            {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onBulkStatusChange('active')}
            className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-md font-body text-sm font-medium hover:bg-success/90 transition-fast"
          >
            <Icon name="CheckIcon" size={16} variant="outline" />
            Activate
          </button>

          <button
            onClick={() => onBulkStatusChange('inactive')}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md font-body text-sm font-medium hover:bg-muted/80 transition-fast"
          >
            <Icon name="XMarkIcon" size={16} variant="outline" />
            Deactivate
          </button>

          <button
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-error text-error-foreground rounded-md font-body text-sm font-medium hover:bg-error/90 transition-fast"
          >
            <Icon name="TrashIcon" size={16} variant="outline" />
            Delete
          </button>

          <button
            onClick={onClearSelection}
            className="p-2 rounded-md hover:bg-muted transition-fast"
            aria-label="Clear selection"
          >
            <Icon name="XMarkIcon" size={20} variant="outline" className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

BulkActionsBar.propTypes = {
  selectedCount: PropTypes?.number?.isRequired,
  onBulkDelete: PropTypes?.func?.isRequired,
  onBulkStatusChange: PropTypes?.func?.isRequired,
  onClearSelection: PropTypes?.func?.isRequired
};