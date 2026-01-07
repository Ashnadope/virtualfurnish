'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ProductFilters({ filters, onFilterChange, onReset }) {
  const categories = ['All Categories', 'Sofa', 'Chair', 'Table', 'Bed', 'Cabinet', 'Desk'];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-base text-foreground">Filters</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-fast"
        >
          <Icon name="ArrowPathIcon" size={16} variant="outline" />
          Reset
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block font-body text-sm font-medium text-foreground mb-2">
            Search Products
          </label>
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={18}
              variant="outline"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="search"
              type="text"
              value={filters?.search}
              onChange={(e) => onFilterChange('search', e?.target?.value)}
              placeholder="Search by name or SKU..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block font-body text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            id="category"
            value={filters?.category}
            onChange={(e) => onFilterChange('category', e?.target?.value)}
            className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block font-body text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            id="status"
            value={filters?.status}
            onChange={(e) => onFilterChange('status', e?.target?.value)}
            className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions?.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priceRange" className="block font-body text-sm font-medium text-foreground mb-2">
            Price Range
          </label>
          <select
            id="priceRange"
            value={filters?.priceRange}
            onChange={(e) => onFilterChange('priceRange', e?.target?.value)}
            className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Prices</option>
            <option value="0-5000">₱0 - ₱5,000</option>
            <option value="5000-15000">₱5,000 - ₱15,000</option>
            <option value="15000-30000">₱15,000 - ₱30,000</option>
            <option value="30000+">₱30,000+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

ProductFilters.propTypes = {
  filters: PropTypes?.shape({
    search: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    status: PropTypes?.string?.isRequired,
    priceRange: PropTypes?.string?.isRequired
  })?.isRequired,
  onFilterChange: PropTypes?.func?.isRequired,
  onReset: PropTypes?.func?.isRequired
};