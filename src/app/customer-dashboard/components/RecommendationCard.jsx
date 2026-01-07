import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import PropTypes from 'prop-types';

export default function RecommendationCard({ product, onAddToCart, onViewDetails }) {
  return (
    <div className="bg-surface rounded-lg shadow-card border border-border overflow-hidden group hover:shadow-elevated transition-smooth">
      <div className="relative h-48 overflow-hidden">
        <AppImage
          src={product?.image}
          alt={product?.alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        {product?.discount && (
          <div className="absolute top-2 left-2 bg-error text-error-foreground px-2 py-1 rounded-md">
            <p className="font-body text-xs font-semibold">-{product?.discount}%</p>
          </div>
        )}
        <button
          onClick={() => onViewDetails(product?.id)}
          className="absolute inset-0 bg-foreground/0 hover:bg-foreground/10 transition-fast"
          aria-label={`View details for ${product?.name}`}
        />
      </div>
      <div className="p-4">
        <p className="font-body text-xs text-muted-foreground mb-1">{product?.category}</p>
        <h4 className="font-heading font-semibold text-foreground mb-2 line-clamp-2">
          {product?.name}
        </h4>
        <div className="flex items-center gap-2 mb-3">
          {product?.discount ? (
            <>
              <p className="font-heading text-lg font-bold text-primary">
                ₱{product?.discountedPrice?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <p className="font-body text-sm text-muted-foreground line-through">
                ₱{product?.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </>
          ) : (
            <p className="font-heading text-lg font-bold text-primary">
              ₱{product?.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)]?.map((_, i) => (
              <Icon
                key={i}
                name="StarIcon"
                size={14}
                variant={i < Math.floor(product?.rating) ? 'solid' : 'outline'}
                className={i < Math.floor(product?.rating) ? 'text-accent' : 'text-muted-foreground'}
              />
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground">
            ({product?.reviews})
          </p>
        </div>
        <button
          onClick={() => onAddToCart(product?.id)}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast flex items-center justify-center gap-2"
        >
          <Icon name="ShoppingCartIcon" size={16} variant="outline" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

RecommendationCard.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    name: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    discountedPrice: PropTypes?.number,
    discount: PropTypes?.number,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    reviews: PropTypes?.number?.isRequired,
  })?.isRequired,
  onAddToCart: PropTypes?.func?.isRequired,
  onViewDetails: PropTypes?.func?.isRequired,
};