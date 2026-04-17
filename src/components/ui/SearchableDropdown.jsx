'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * A searchable dropdown (combobox) component.
 *
 * Props:
 *  - label        {string}   Field label
 *  - options      {string[]} Flat list of option strings
 *  - value        {string}   Currently selected value
 *  - onChange      {(val: string) => void}
 *  - placeholder  {string}   Input placeholder
 *  - disabled     {boolean}
 *  - required     {boolean}
 *  - error        {string}   Validation error text
 */
export default function SearchableDropdown({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Search…',
  disabled = false,
  required = false,
  error,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filtered options
  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(-1);
  }, [filtered.length, query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIdx]);

  const select = useCallback(
    (val) => {
      onChange(val);
      setQuery('');
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          select(filtered[highlightIdx]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  const displayText = value || '';

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input / trigger */}
      <div
        className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
          error
            ? 'border-red-500'
            : isOpen
            ? 'border-amber-500 ring-1 ring-amber-500'
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2.5 text-sm outline-none bg-transparent disabled:cursor-not-allowed"
          placeholder={value ? displayText : placeholder}
          value={isOpen ? query : displayText}
          disabled={disabled}
          readOnly={!isOpen}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setQuery('');
            }
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          className="px-2 text-gray-400 hover:text-gray-600"
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (!isOpen) inputRef.current?.focus();
            }
          }}
          aria-label="Toggle dropdown"
        >
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown list */}
      {isOpen && !disabled && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">No results found</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={opt === value}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  i === highlightIdx
                    ? 'bg-amber-50 text-amber-900'
                    : opt === value
                    ? 'bg-amber-100 font-medium'
                    : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHighlightIdx(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // keep focus on input
                  select(opt);
                }}
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
