'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function AISuggestionControls({ onGetLayoutSuggestions, onGetColorMatching, isProcessing }) {
  const [showTooltip, setShowTooltip] = useState(null);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-accent/10 border-b border-accent/20">
      <div className="flex items-center gap-2">
        <Icon name="SparklesIcon" size={20} variant="solid" className="text-accent" />
        <span className="font-heading font-semibold text-sm text-foreground">AI Suggestions</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative">
          <button
            onClick={onGetLayoutSuggestions}
            disabled={isProcessing}
            onMouseEnter={() => setShowTooltip('layout')}
            onMouseLeave={() => setShowTooltip(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="Square3Stack3DIcon" size={18} variant="solid" />
            <span className="font-body text-sm font-medium">Layout Suggestions</span>
          </button>
          {showTooltip === 'layout' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs font-body rounded-md shadow-elevated whitespace-nowrap z-overlay">
              Get AI-powered furniture placement recommendations
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={onGetColorMatching}
            disabled={isProcessing}
            onMouseEnter={() => setShowTooltip('color')}
            onMouseLeave={() => setShowTooltip(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-accent text-accent hover:bg-accent/10 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="SwatchIcon" size={18} variant="solid" />
            <span className="font-body text-sm font-medium">Color Matching</span>
          </button>
          {showTooltip === 'color' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs font-body rounded-md shadow-elevated whitespace-nowrap z-overlay">
              Get color palette recommendations for your room
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 ml-4">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="font-body text-sm text-muted-foreground">Processing...</span>
        </div>
      )}
    </div>
  );
}

AISuggestionControls.propTypes = {
  onGetLayoutSuggestions: PropTypes?.func?.isRequired,
  onGetColorMatching: PropTypes?.func?.isRequired,
  isProcessing: PropTypes?.bool?.isRequired
};