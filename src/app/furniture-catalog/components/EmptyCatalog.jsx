'use client';

import PropTypes from 'prop-types';

export default function EmptyCatalog({ hasFilters, onClearFilters }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        
        {hasFilters ? (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching your current filters. 
              Try adjusting your search or filter criteria.
            </p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No products available
            </h3>
            <p className="text-gray-600">
              Our catalog is currently empty. Please check back later for new furniture items.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

EmptyCatalog.propTypes = {
  hasFilters: PropTypes?.bool,
  onClearFilters: PropTypes?.func
};