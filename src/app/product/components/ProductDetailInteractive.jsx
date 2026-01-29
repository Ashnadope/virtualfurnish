'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { cartService } from '@/services/cart.service';

export default function ProductDetailInteractive({ product }) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  const lowestPrice = product?.variants?.length > 0
    ? Math.min(...product?.variants?.map(v => parseFloat(v?.price || product?.basePrice || 0)))
    : parseFloat(product?.basePrice || 0);

  const currentPrice = selectedVariant?.price || lowestPrice;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setCartMessage({ type: 'error', text: 'Please select a variant' });
      return;
    }

    setIsAddingToCart(true);
    try {
      const { success, error } = await cartService.addToCart({
        productId: product?.id,
        variantId: selectedVariant?.id,
        quantity: parseInt(quantity),
        price: parseFloat(selectedVariant?.price || product?.basePrice)
      });

      if (success) {
        setCartMessage({ type: 'success', text: 'Added to cart successfully!' });
        setQuantity(1);
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        setCartMessage({ type: 'error', text: error || 'Failed to add to cart' });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setCartMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleGoToCart = () => {
    router.push('/cart');
  };

  const colorVariants = product?.variants?.filter(v => v?.color);
  const sizeVariants = product?.variants?.filter(v => v?.size);
  const uniqueColors = [...new Set(colorVariants?.map(v => v?.color)?.filter(Boolean))];
  const uniqueSizes = [...new Set(sizeVariants?.map(v => v?.size)?.filter(Boolean))];

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-muted-foreground">
        <a href="/furniture-catalog" className="hover:text-foreground transition-colors">
          Furniture Catalog
        </a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product?.name}</span>
      </nav>

      {/* Product Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {!imageError ? (
            <AppImage
              src={product?.imageUrl || '/assets/images/no_image.png'}
              alt={product?.name}
              className="w-full h-auto object-cover aspect-square"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center bg-muted">
              <div className="text-center">
                <Icon name="PhotoIcon" size={48} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No Image Available</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Brand and Name */}
          {product?.brand && (
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{product?.brand}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product?.name}</h1>

          {/* Description */}
          {product?.description && (
            <p className="text-lg text-muted-foreground leading-relaxed">{product?.description}</p>
          )}

          {/* Price */}
          <div className="space-y-2">
            <p className="text-4xl font-bold text-primary">{formatPrice(currentPrice)}</p>
            {product?.variants?.length > 1 && (
              <p className="text-sm text-muted-foreground">
                {product?.variants?.length} variants available
              </p>
            )}
          </div>

          {/* Variant Selectors */}
          {product?.variants?.length > 1 && (
            <div className="space-y-4 py-6 border-y border-border">
              {/* Color Selector */}
              {uniqueColors?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Color: <span className="text-primary">{selectedVariant?.color || 'Select'}</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {uniqueColors?.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          const variant = product?.variants?.find(v => v?.color === color);
                          if (variant) setSelectedVariant(variant);
                        }}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedVariant?.color === color
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-primary'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {uniqueSizes?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Size: <span className="text-primary">{selectedVariant?.size || 'Select'}</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {uniqueSizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          const variant = product?.variants?.find(v => v?.size === size);
                          if (variant) setSelectedVariant(variant);
                        }}
                        className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedVariant?.size === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Info */}
              {selectedVariant?.stockQuantity && (
                <p className={`text-sm font-medium ${
                  selectedVariant?.stockQuantity > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {selectedVariant?.stockQuantity > 0 
                    ? `${selectedVariant?.stockQuantity} in stock`
                    : 'Out of stock'
                  }
                </p>
              )}
            </div>
          )}

          {/* Quantity Selector and Add to Cart */}
          <div className="space-y-4 pt-6">
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-foreground">Quantity:</label>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  disabled={isAddingToCart}
                >
                  <Icon name="MinusIcon" size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-3 py-2 text-center bg-background border-l border-r border-border text-foreground focus:outline-none"
                  disabled={isAddingToCart}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  disabled={isAddingToCart}
                >
                  <Icon name="PlusIcon" size={16} />
                </button>
              </div>
            </div>

            {/* Cart Message */}
            {cartMessage && (
              <div className={`p-4 rounded-lg ${
                cartMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm font-medium">{cartMessage.text}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || (selectedVariant?.stockQuantity === 0)}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <>
                    <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Icon name="ShoppingCartIcon" size={20} />
                    Add to Cart
                  </>
                )}
              </button>
              {cartMessage?.type === 'success' && (
                <button
                  onClick={handleGoToCart}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 active:bg-secondary/80 transition-all"
                >
                  Go to Cart
                </button>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="flex items-start gap-3">
              <Icon name="TruckIcon" size={20} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Free Shipping</p>
                <p className="text-sm text-muted-foreground">On orders over PHP 2,000</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="ArrowUturnLeftIcon" size={20} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Easy Returns</p>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Sections Placeholder */}
      <div className="border-t border-border pt-8">
        <p className="text-sm text-muted-foreground italic">
          ✨ Reviews, specifications, and related products coming soon
        </p>
      </div>
    </div>
  );
}
