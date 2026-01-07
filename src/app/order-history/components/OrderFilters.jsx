'use client';

import PropTypes from 'prop-types';

export default function OrderFilters({ filters, onFilterChange }) {
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters?.status || 'all'}
            onChange={(e) => onFilterChange?.({ status: e?.target?.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Order # or product name"
            value={filters?.search || ''}
            onChange={(e) => onFilterChange?.({ search: e?.target?.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            id="startDate"
            type="date"
            value={filters?.startDate || ''}
            onChange={(e) => onFilterChange?.({ startDate: e?.target?.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            id="endDate"
            type="date"
            value={filters?.endDate || ''}
            onChange={(e) => onFilterChange?.({ endDate: e?.target?.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters?.status !== 'all' || filters?.search || filters?.startDate || filters?.endDate) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onFilterChange?.({ 
              status: 'all', 
              search: '', 
              startDate: null, 
              endDate: null 
            })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

OrderFilters.propTypes = {
  filters: PropTypes?.shape({
    status: PropTypes?.string,
    search: PropTypes?.string,
    startDate: PropTypes?.string,
    endDate: PropTypes?.string
  })?.isRequired,
  onFilterChange: PropTypes?.func?.isRequired
};