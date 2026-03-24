'use client';

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import DateRangeFilter from './DateRangeFilter';
import ExportButton from './ExportButton';
import { exportAnalyticsCSV, exportAnalyticsExcel, exportAnalyticsPDF } from '@/utils/analyticsExport';
import MetricCard from './MetricCard';
import SalesChart from './SalesChart';
import ProductPerformanceTable from './ProductPerformanceTable';
import CustomerSegmentChart from './CustomerSegmentChart';
import RoomDesignerStats from './RoomDesignerStats';
import GeographicDistribution from './GeographicDistribution';

export default function AnalyticsInteractive({ initialData }) {
  const [dateRange, setDateRange] = useState('30days');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('[AnalyticsInteractive] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (range) => {
    setDateRange(range);
    fetchData(range);
  };

  const handleExport = async (format) => {
    if (format === 'csv')   { exportAnalyticsCSV(data, dateRange); return; }
    if (format === 'excel') { exportAnalyticsExcel(data, dateRange); return; }
    if (format === 'pdf')   { await exportAnalyticsPDF(data, dateRange); }
  };

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <DateRangeFilter onFilterChange={handleFilterChange} />
        <ExportButton onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.metrics?.map((metric) => (
          <MetricCard key={metric?.id} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={data?.salesData} title="Monthly Sales Trends" />
        <CustomerSegmentChart data={data?.customerSegments} title="Customer Segments" />
      </div>
      <ProductPerformanceTable products={data?.topProducts} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomDesignerStats stats={data?.roomDesignerStats} />
        <GeographicDistribution regions={data?.geographicData} />
      </div>
    </div>
  );
}