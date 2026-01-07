'use client';

import PropTypes from 'prop-types';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">
          {message || 'Failed to load the catalog. Please try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes?.string,
  onRetry: PropTypes?.func
};