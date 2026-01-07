'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function CartSummary({ subtotal, shipping, total, itemCount, onCheckout, disabled }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 sticky top-24">
      <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
        Order Summary
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between font-body text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-foreground">
            ₱{subtotal?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between font-body text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">
            {shipping > 0 
              ? `₱${shipping?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
              : 'FREE'}
          </span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold text-foreground">Total</span>
            <span className="font-heading font-bold text-xl text-primary">
              ₱{total?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={disabled}
        className="w-full py-3 px-4 bg-primary text-primary-foreground font-body font-medium rounded-md hover:bg-primary/90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>Proceed to Checkout</span>
        <Icon name="ArrowRightIcon" size={20} variant="outline" />
      </button>

      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2 font-body text-xs text-muted-foreground">
          <Icon name="ShieldCheckIcon" size={16} variant="outline" className="flex-shrink-0 mt-0.5" />
          <span>Secure checkout with Stripe & GCash</span>
        </div>
        <div className="flex items-start gap-2 font-body text-xs text-muted-foreground">
          <Icon name="TruckIcon" size={16} variant="outline" className="flex-shrink-0 mt-0.5" />
          <span>Free delivery on orders over ₱50,000</span>
        </div>
        <div className="flex items-start gap-2 font-body text-xs text-muted-foreground">
          <Icon name="ArrowPathIcon" size={16} variant="outline" className="flex-shrink-0 mt-0.5" />
          <span>30-day return policy</span>
        </div>
      </div>
    </div>
  );
}

CartSummary.propTypes = {
  subtotal: PropTypes?.number?.isRequired,
  shipping: PropTypes?.number?.isRequired,
  total: PropTypes?.number?.isRequired,
  itemCount: PropTypes?.number?.isRequired,
  onCheckout: PropTypes?.func?.isRequired,
  disabled: PropTypes?.bool
};