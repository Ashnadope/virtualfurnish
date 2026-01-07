'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ActionToolbar({ 
  onUndo, 
  onRedo, 
  onReset, 
  onSave, 
  onExport,
  canUndo,
  canRedo,
  hasChanges
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-md hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Undo"
        >
          <Icon name="ArrowUturnLeftIcon" size={20} variant="outline" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-md hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Redo"
        >
          <Icon name="ArrowUturnRightIcon" size={20} variant="outline" />
        </button>
        <div className="w-px h-6 bg-border mx-2" />
        <button
          onClick={onReset}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="ArrowPathIcon" size={18} variant="outline" />
          <span className="font-body text-sm text-foreground">Reset</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="BookmarkIcon" size={18} variant="solid" />
          <span className="font-body text-sm font-medium">Save Design</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted transition-fast"
        >
          <Icon name="ArrowDownTrayIcon" size={18} variant="outline" />
          <span className="font-body text-sm font-medium text-foreground">Export</span>
        </button>
      </div>
    </div>
  );
}

ActionToolbar.propTypes = {
  onUndo: PropTypes?.func?.isRequired,
  onRedo: PropTypes?.func?.isRequired,
  onReset: PropTypes?.func?.isRequired,
  onSave: PropTypes?.func?.isRequired,
  onExport: PropTypes?.func?.isRequired,
  canUndo: PropTypes?.bool?.isRequired,
  canRedo: PropTypes?.bool?.isRequired,
  hasChanges: PropTypes?.bool?.isRequired
};