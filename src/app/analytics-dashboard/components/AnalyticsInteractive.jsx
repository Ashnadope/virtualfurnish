'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import DateRangeFilter from './DateRangeFilter';
import ExportButton from './ExportButton';
import MetricCard from './MetricCard';
import SalesChart from './SalesChart';
import ProductPerformanceTable from './ProductPerformanceTable';
import CustomerSegmentChart from './CustomerSegmentChart';
import RoomDesignerStats from './RoomDesignerStats';
import GeographicDistribution from './GeographicDistribution';

export default function AnalyticsInteractive({ initialData }) {
  const [dateRange, setDateRange] = useState('30days');

  const handleFilterChange = (range) => {
    setDateRange(range);
  };

  const handleExport = (format) => {
    alert(`Exporting analytics data as ${format?.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <DateRangeFilter onFilterChange={handleFilterChange} />
        <ExportButton onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialData?.metrics?.map((metric) => (
          <MetricCard key={metric?.id} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={initialData?.salesData} title="Monthly Sales Trends" />
        <CustomerSegmentChart data={initialData?.customerSegments} title="Customer Segments" />
      </div>
      <ProductPerformanceTable products={initialData?.topProducts} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomDesignerStats stats={initialData?.roomDesignerStats} />
        <GeographicDistribution regions={initialData?.geographicData} />
      </div>
    </div>
  );
}

AnalyticsInteractive.propTypes = {
  initialData: PropTypes?.shape({
    metrics: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        title: PropTypes?.string?.isRequired,
        value: PropTypes?.string?.isRequired,
        change: PropTypes?.string,
        changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral']),
        icon: PropTypes?.string?.isRequired,
        currency: PropTypes?.bool
      })
    )?.isRequired,
    salesData: PropTypes?.array?.isRequired,
    topProducts: PropTypes?.array?.isRequired,
    customerSegments: PropTypes?.array?.isRequired,
    roomDesignerStats: PropTypes?.array?.isRequired,
    geographicData: PropTypes?.array?.isRequired
  })?.isRequired
};