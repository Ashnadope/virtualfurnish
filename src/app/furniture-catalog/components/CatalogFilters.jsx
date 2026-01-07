'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';

export default function CatalogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange
}) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  const handlePriceChange = (type, value) => {
    const newRange = {
      ...localPriceRange,
      [type]: parseInt(value) || 0
    };
    setLocalPriceRange(newRange);
  };

  const applyPriceRange = () => {
    onPriceRangeChange?.(localPriceRange);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Filters
      </h2>
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Category
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange?.('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all' ?'bg-blue-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories?.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange?.(category)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      {/* Sort By */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange?.(e?.target?.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {sortOptions?.map(option => (
            <option key={option?.value} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
      </div>
      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Price Range (₱)
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Minimum
            </label>
            <input
              type="number"
              value={localPriceRange?.min}
              onChange={(e) => handlePriceChange('min', e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Maximum
            </label>
            <input
              type="number"
              value={localPriceRange?.max}
              onChange={(e) => handlePriceChange('max', e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100000"
            />
          </div>
          <button
            onClick={applyPriceRange}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply
          </button>
        </div>
      </div>
      {/* Clear Filters */}
      <button
        onClick={() => {
          onCategoryChange?.('all');
          onSortChange?.('newest');
          setLocalPriceRange({ min: 0, max: 100000 });
          onPriceRangeChange?.({ min: 0, max: 100000 });
        }}
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        Clear All Filters
      </button>
    </div>
  );
}

CatalogFilters.propTypes = {
  categories: PropTypes?.arrayOf(PropTypes?.string)?.isRequired,
  selectedCategory: PropTypes?.string?.isRequired,
  onCategoryChange: PropTypes?.func?.isRequired,
  sortBy: PropTypes?.string?.isRequired,
  onSortChange: PropTypes?.func?.isRequired,
  priceRange: PropTypes?.shape({
    min: PropTypes?.number,
    max: PropTypes?.number
  })?.isRequired,
  onPriceRangeChange: PropTypes?.func?.isRequired
};