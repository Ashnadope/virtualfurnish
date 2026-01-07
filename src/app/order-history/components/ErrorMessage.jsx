'use client';

import PropTypes from 'prop-types';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">
          {message || 'Failed to load orders. Please try again.'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes?.string,
  onRetry: PropTypes?.func?.isRequired
};