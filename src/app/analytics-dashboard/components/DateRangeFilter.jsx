'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function DateRangeFilter({ onFilterChange }) {
  const [selectedRange, setSelectedRange] = useState('30days');

  const ranges = [
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: '90days', label: 'Last 90 Days' },
    { id: 'year', label: 'This Year' }
  ];

  const handleRangeChange = (rangeId) => {
    setSelectedRange(rangeId);
    onFilterChange(rangeId);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Icon name="CalendarIcon" size={20} variant="outline" className="text-muted-foreground" />
      <div className="flex items-center gap-2">
        {ranges?.map((range) => (
          <button
            key={range?.id}
            onClick={() => handleRangeChange(range?.id)}
            className={`px-4 py-2 rounded-md font-body text-sm transition-fast ${
              selectedRange === range?.id
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {range?.label}
          </button>
        ))}
      </div>
    </div>
  );
}

DateRangeFilter.propTypes = {
  onFilterChange: PropTypes?.func?.isRequired
};