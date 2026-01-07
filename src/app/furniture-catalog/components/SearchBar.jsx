'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder }) {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch?.(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch?.('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e?.target?.value);
            onSearch?.(e?.target?.value);
          }}
          placeholder={placeholder || 'Search products...'}
          className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes?.func?.isRequired,
  placeholder: PropTypes?.string
};