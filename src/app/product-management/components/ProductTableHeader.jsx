import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ProductTableHeader({ sortField, sortDirection, onSort, allSelected, onSelectAll }) {
  const columns = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  const handleSort = (key) => {
    if (sortField === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <thead className="bg-muted border-b border-border">
      <tr>
        <th className="px-4 py-3 text-left">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e?.target?.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Select all products"
          />
        </th>
        {columns?.map((column) => (
          <th key={column?.key} className="px-4 py-3 text-left">
            {column?.sortable ? (
              <button
                onClick={() => handleSort(column?.key)}
                className="flex items-center gap-2 font-body font-semibold text-sm text-foreground hover:text-primary transition-fast"
              >
                {column?.label}
                {sortField === column?.key && (
                  <Icon
                    name={sortDirection === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    size={16}
                    variant="solid"
                  />
                )}
              </button>
            ) : (
              <span className="font-body font-semibold text-sm text-foreground">{column?.label}</span>
            )}
          </th>
        ))}
        <th className="px-4 py-3 text-left">
          <span className="font-body font-semibold text-sm text-foreground">Actions</span>
        </th>
      </tr>
    </thead>
  );
}

ProductTableHeader.propTypes = {
  sortField: PropTypes?.string?.isRequired,
  sortDirection: PropTypes?.oneOf(['asc', 'desc'])?.isRequired,
  onSort: PropTypes?.func?.isRequired,
  allSelected: PropTypes?.bool?.isRequired,
  onSelectAll: PropTypes?.func?.isRequired
};