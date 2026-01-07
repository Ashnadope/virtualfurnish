'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, productCount = 1 }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-dropdown" onClick={onClose} />
      <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg shadow-elevated w-full max-w-md animate-slide-in">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" size={24} variant="outline" className="text-error" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  Delete {productCount === 1 ? 'Product' : 'Products'}
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="font-body text-sm text-foreground mb-6">
              Are you sure you want to delete {productCount === 1 ? 'this product' : `these ${productCount} products`}? 
              All associated data will be permanently removed from the system.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-border rounded-md font-body text-sm font-medium text-foreground hover:bg-muted transition-fast"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-error text-error-foreground rounded-md font-body text-sm font-medium hover:bg-error/90 transition-fast"
              >
                Delete {productCount === 1 ? 'Product' : 'Products'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes?.bool?.isRequired,
  onClose: PropTypes?.func?.isRequired,
  onConfirm: PropTypes?.func?.isRequired,
  productCount: PropTypes?.number
};