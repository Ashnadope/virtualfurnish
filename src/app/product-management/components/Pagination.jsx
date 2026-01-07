'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages?.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages?.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages?.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages?.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
      <div className="flex items-center gap-2">
        <span className="font-body text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-border hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <Icon name="ChevronLeftIcon" size={20} variant="outline" />
        </button>

        {getPageNumbers()?.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[40px] h-10 px-3 rounded-md font-body text-sm font-medium transition-fast ${
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : page === '...' ?'cursor-default text-muted-foreground' :'border border-border hover:bg-muted text-foreground'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-border hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <Icon name="ChevronRightIcon" size={20} variant="outline" />
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes?.number?.isRequired,
  totalPages: PropTypes?.number?.isRequired,
  onPageChange: PropTypes?.func?.isRequired
};