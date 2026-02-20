'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function ProductTableRow({ product, onEdit, onDelete, onToggleStatus, isSelected, onSelect }) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })?.format(price);
  };

  const formatPriceRange = (product) => {
    const variants = product?.variants;
    if (!variants || variants.length === 0) return formatPrice(product?.price ?? 0);
    const prices = variants.map(v => parseFloat(v.price || 0)).filter(n => !isNaN(n)).sort((a, b) => a - b);
    if (prices.length === 0) return formatPrice(product?.price ?? 0);
    const min = prices[0];
    const max = prices[prices.length - 1];
    return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
  };

  const getStatusColor = (status) => {
    return status === 'active' ?'bg-success/10 text-success border-success/20' :'bg-muted text-muted-foreground border-border';
  };

  const getStockSummary = (product) => {
    const variants = product?.variants;
    if (!variants || variants.length === 0) {
      const s = product?.stock ?? 0;
      return { total: s, outCount: s === 0 ? 1 : 0, lowCount: (s > 0 && s < 10) ? 1 : 0 };
    }
    const stocks = variants.map(v => v.stockQuantity ?? 0);
    return {
      total: stocks.reduce((a, b) => a + b, 0),
      outCount: stocks.filter(s => s === 0).length,
      lowCount: stocks.filter(s => s > 0 && s < 10).length,
    };
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-fast">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(product?.id, e?.target?.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
          aria-label={`Select ${product?.name}`}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {!imageError ? (
              <AppImage
                src={product?.image}
                alt={product?.imageAlt}
                className="w-full h-full object-cover"
                width={48}
                height={48}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="PhotoIcon" size={24} variant="outline" className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-body font-medium text-sm text-foreground truncate">{product?.name}</p>
            <p className="font-body text-xs text-muted-foreground truncate">{product?.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          {product?.category}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-body font-semibold text-sm text-foreground">{formatPriceRange(product)}</span>
      </td>
      <td className="px-4 py-3">
        {(() => {
          const { total, outCount, lowCount } = getStockSummary(product);
          const totalColor = outCount > 0 ? 'text-error' : lowCount > 0 ? 'text-warning' : 'text-success';
          return (
            <div className="flex flex-col gap-0.5">
              <span className={`font-body font-medium text-sm ${totalColor}`}>{total}</span>
              {outCount > 0 && (
                <span className="text-xs text-error font-medium">
                  {outCount} variant{outCount > 1 ? 's' : ''} out of stock
                </span>
              )}
              {outCount === 0 && lowCount > 0 && (
                <span className="text-xs text-warning font-medium">
                  {lowCount} variant{lowCount > 1 ? 's' : ''} low stock
                </span>
              )}
            </div>
          );
        })()}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleStatus(product?.id)}
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-fast ${getStatusColor(product?.status)}`}
          aria-label={`Toggle status for ${product?.name}`}
        >
          {product?.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-md hover:bg-muted transition-fast"
            aria-label={`Edit ${product?.name}`}
          >
            <Icon name="PencilIcon" size={18} variant="outline" className="text-foreground" />
          </button>
          <button
            onClick={() => onDelete(product?.id)}
            className="p-1.5 rounded-md hover:bg-error/10 transition-fast"
            aria-label={`Delete ${product?.name}`}
          >
            <Icon name="TrashIcon" size={18} variant="outline" className="text-error" />
          </button>
        </div>
      </td>
    </tr>
  );
}

ProductTableRow.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    name: PropTypes?.string?.isRequired,
    sku: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    stock: PropTypes?.number?.isRequired,
    status: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    imageAlt: PropTypes?.string?.isRequired
  })?.isRequired,
  onEdit: PropTypes?.func?.isRequired,
  onDelete: PropTypes?.func?.isRequired,
  onToggleStatus: PropTypes?.func?.isRequired,
  isSelected: PropTypes?.bool?.isRequired,
  onSelect: PropTypes?.func?.isRequired
};