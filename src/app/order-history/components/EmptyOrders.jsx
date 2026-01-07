'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';

export default function EmptyOrders({ hasFilters, onClearFilters }) {
  if (hasFilters) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No orders found
        </h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your filters to see more results
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No orders yet
      </h3>
      <p className="text-gray-600 mb-6">
        Start shopping to see your order history here
      </p>
      <Link
        href="/landing-page"
        className="inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Browse Furniture
      </Link>
    </div>
  );
}

EmptyOrders.propTypes = {
  hasFilters: PropTypes?.bool,
  onClearFilters: PropTypes?.func
};