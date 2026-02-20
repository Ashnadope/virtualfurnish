'use client';

import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function CartItem({ item, onUpdateQuantity, onRemove, disabled }) {
  const product = item?.products;
  const variant = item?.product_variants;
  
  const itemPrice = parseFloat(variant?.price || item?.price || product?.base_price || 0);
  const itemQuantity = parseInt(item?.quantity || 0);
  const itemTotal = itemPrice * itemQuantity;
  const stockAvailable = parseInt(variant?.stock_quantity || 0);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || newQuantity > stockAvailable) return;
    onUpdateQuantity?.(item?.id, newQuantity);
  };

  const handleRemove = () => {
    onRemove?.(item?.id);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-sm transition-fast">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-md overflow-hidden">
          <AppImage
            src={variant?.image_url || product?.image_url}
            alt={`${product?.name} - ${variant?.name || 'Product image'}`}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground line-clamp-1">
                {product?.name}
              </h3>
              
              {variant && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {variant?.name && (
                    <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                      {variant?.name}
                    </span>
                  )}
                  {variant?.color && (
                    <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                      {variant?.color}
                    </span>
                  )}

                </div>
              )}

              <p className="font-body text-sm text-muted-foreground mt-1">
                {product?.brand && `${product?.brand} • `}
                {product?.category}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={disabled}
              className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-fast disabled:opacity-50"
              aria-label="Remove item"
            >
              <Icon name="TrashIcon" size={20} variant="outline" />
            </button>
          </div>

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(itemQuantity - 1)}
                disabled={disabled || itemQuantity <= 1}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-md hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Icon name="MinusIcon" size={16} variant="outline" />
              </button>
              
              <span className="font-body font-medium text-foreground w-8 text-center">
                {itemQuantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(itemQuantity + 1)}
                disabled={disabled || itemQuantity >= stockAvailable}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-md hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Icon name="PlusIcon" size={16} variant="outline" />
              </button>

              <span className="font-body text-xs text-muted-foreground ml-2">
                {stockAvailable > 0 ? `${stockAvailable} available` : 'Out of stock'}
              </span>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-heading font-semibold text-lg text-foreground">
                ₱{itemTotal?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                ₱{itemPrice?.toLocaleString('en-PH', { minimumFractionDigits: 2 })} each
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CartItem.propTypes = {
  item: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    quantity: PropTypes?.number?.isRequired,
    price: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number]),
    products: PropTypes?.shape({
      name: PropTypes?.string,
      brand: PropTypes?.string,
      category: PropTypes?.string,
      image_url: PropTypes?.string,
      base_price: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])
    }),
    product_variants: PropTypes?.shape({
      name: PropTypes?.string,
      color: PropTypes?.string,
      size: PropTypes?.string,
      price: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number]),
      stock_quantity: PropTypes?.number
    })
  })?.isRequired,
  onUpdateQuantity: PropTypes?.func,
  onRemove: PropTypes?.func,
  disabled: PropTypes?.bool
};