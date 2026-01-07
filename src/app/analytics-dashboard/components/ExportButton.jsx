'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ExportButton({ onExport }) {
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { id: 'pdf', label: 'Export as PDF', icon: 'DocumentTextIcon' },
    { id: 'excel', label: 'Export as Excel', icon: 'TableCellsIcon' },
    { id: 'csv', label: 'Export as CSV', icon: 'DocumentIcon' }
  ];

  const handleExport = (formatId) => {
    onExport(formatId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-fast font-body text-sm font-medium shadow-card"
      >
        <Icon name="ArrowDownTrayIcon" size={20} variant="outline" />
        <span>Export Data</span>
        <Icon name="ChevronDownIcon" size={16} variant="outline" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-dropdown"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-elevated z-overlay animate-slide-in">
            <div className="py-2">
              {formats?.map((format) => (
                <button
                  key={format?.id}
                  onClick={() => handleExport(format?.id)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-fast"
                >
                  <Icon name={format?.icon} size={18} variant="outline" />
                  <span>{format?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

ExportButton.propTypes = {
  onExport: PropTypes?.func?.isRequired
};