import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function InventoryAlertItem({ product }) {
  const isOutOfStock = product?.stock === 0;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <AppImage 
          src={product?.image} 
          alt={product?.alt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-body text-sm font-medium text-foreground mb-1 truncate">{product?.name}</h5>
        <p className="font-body text-xs text-muted-foreground mb-1">SKU: {product?.sku}</p>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            isOutOfStock 
              ? 'bg-error/10 text-error' :'bg-warning/10 text-warning'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `Low Stock: ${product?.stock} units`}
          </span>
        </div>
      </div>
      <Link 
        href="/product-management"
        className="flex-shrink-0 p-2 rounded-md hover:bg-muted transition-fast"
        aria-label={`Manage ${product?.name}`}
      >
        <Icon name="PencilSquareIcon" size={20} variant="outline" className="text-muted-foreground" />
      </Link>
    </div>
  );
}

InventoryAlertItem.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    name: PropTypes?.string?.isRequired,
    sku: PropTypes?.string?.isRequired,
    stock: PropTypes?.number?.isRequired,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
  })?.isRequired,
};