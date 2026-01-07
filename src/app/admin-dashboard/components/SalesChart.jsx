'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


export default function SalesChart({ data }) {
  const [timeRange, setTimeRange] = useState('week');

  const filterData = () => {
    switch (timeRange) {
      case 'week':
        return data?.slice(0, 7);
      case 'month':
        return data?.slice(0, 30);
      case 'year':
        return data;
      default:
        return data;
    }
  };

  const filteredData = filterData();

  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Sales Overview</h3>
          <p className="font-body text-sm text-muted-foreground">Revenue trends and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
              timeRange === 'week' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
              timeRange === 'month' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
              timeRange === 'year' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      <div className="w-full h-80" aria-label="Sales revenue bar chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#718096', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis 
              tick={{ fill: '#718096', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={(value) => `₱${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value) => [`₱${value?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Revenue']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="revenue" fill="#1E3A5F" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

SalesChart.propTypes = {
  data: PropTypes?.arrayOf(
    PropTypes?.shape({
      date: PropTypes?.string?.isRequired,
      revenue: PropTypes?.number?.isRequired,
    })
  )?.isRequired,
};