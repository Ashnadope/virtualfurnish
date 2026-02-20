'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/auth.hook';
import { wishlistService } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';
import Header from '@/components/common/Header';
import AppImage from '@/components/ui/AppImage';



// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('date_added');
  const [filterCategory, setFilterCategory] = useState('all');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadWishlist();
    }
  }, [user?.id]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      let items = await wishlistService?.getWishlistItems(user?.id);
      setWishlistItems(items || []);
    } catch (err) {
      setError(err?.message || 'Failed to load wishlist');
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await wishlistService?.removeFromWishlist(itemId, user?.id);
      setWishlistItems(prev => prev?.filter(item => item?.id !== itemId) || []);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet?.delete(itemId);
        return newSet;
      });
    } catch (err) {
      setError(err?.message || 'Failed to remove item');
    }
  };

  const handleAddToCart = async (item) => {
    const productId = item?.product?.id;
    const variantId = item?.variantId || null;
    const price = item?.variant?.price ?? item?.product?.basePrice;
    try {
      setAddingToCart(item?.id);
      await cartService?.addToCart({ productId, variantId, quantity: 1, price });
      // Optionally remove from wishlist after adding to cart
      await handleRemoveFromWishlist(item?.id);
    } catch (err) {
      setError(err?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBulkAddToCart = async () => {
    try {
      const selectedProducts = wishlistItems?.filter(item => selectedItems?.has(item?.id));
      for (const item of selectedProducts) {
        await cartService?.addToCart({
          productId: item?.product?.id,
          variantId: item?.variantId || null,
          quantity: 1,
          price: item?.variant?.price ?? item?.product?.basePrice
        });
        await handleRemoveFromWishlist(item?.id);
      }
      setSelectedItems(new Set());
    } catch (err) {
      setError(err?.message || 'Failed to add items to cart');
    }
  };

  const handleBulkRemove = async () => {
    try {
      const itemsToRemove = Array.from(selectedItems);
      for (const itemId of itemsToRemove) {
        await wishlistService?.removeFromWishlist(itemId, user?.id);
      }
      setWishlistItems(prev => prev?.filter(item => !selectedItems?.has(item?.id)) || []);
      setSelectedItems(new Set());
    } catch (err) {
      setError(err?.message || 'Failed to remove items');
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(itemId)) {
        newSet?.delete(itemId);
      } else {
        newSet?.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems?.size === wishlistItems?.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems?.map(item => item?.id)));
    }
  };

  const getSortedAndFilteredItems = () => {
    let items = [...(wishlistItems || [])];

    // Filter by category
    if (filterCategory !== 'all') {
      items = items?.filter(item => item?.product?.category === filterCategory);
    }

    // Sort items
    switch (sortBy) {
      case 'date_added':
        items?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt));
        break;
      case 'price_low':
        items?.sort((a, b) => (a?.product?.basePrice || 0) - (b?.product?.basePrice || 0));
        break;
      case 'price_high':
        items?.sort((a, b) => (b?.product?.basePrice || 0) - (a?.product?.basePrice || 0));
        break;
      case 'name':
        items?.sort((a, b) => (a?.product?.name || '')?.localeCompare(b?.product?.name || ''));
        break;
      default:
        break;
    }

    return items;
  };

  const filteredItems = getSortedAndFilteredItems();
  const categories = ['all', ...new Set(wishlistItems?.map(item => item?.product?.category)?.filter(Boolean))];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-8">You need to be signed in to view your wishlist</p>
          <button
            onClick={() => router?.push('/login')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems?.length || 0} {wishlistItems?.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e?.target?.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories?.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date_added">Date Added</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedItems?.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkAddToCart}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Selected to Cart ({selectedItems?.size})
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove Selected
                </button>
              </div>
            )}
          </div>

          {/* Select All */}
          {wishlistItems?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems?.size === wishlistItems?.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Select All</span>
              </label>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems?.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding furniture items you love to your wishlist</p>
            <button
              onClick={() => router?.push('/furniture-catalog')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Catalog
            </button>
          </div>
        )}

        {/* Wishlist Items Grid */}
        {!loading && filteredItems?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems?.map(item => (
              <WishlistCard
                key={item?.id}
                item={item}
                isSelected={selectedItems?.has(item?.id)}
                onToggleSelect={() => toggleSelectItem(item?.id)}
                onRemove={() => handleRemoveFromWishlist(item?.id)}
                onAddToCart={() => handleAddToCart(item)}
                onViewDetails={() => router?.push(`/product/${item?.product?.id}`)}
                isAddingToCart={addingToCart === item?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WishlistCard({ item, isSelected, onToggleSelect, onRemove, onAddToCart, onViewDetails, isAddingToCart }) {
  const product = item?.product || {};
  const variant = item?.variant || null;
  // Variant-specific price takes priority; fall back to product base price
  const displayPrice = variant?.price ?? product?.basePrice ?? 0;
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  })?.format(displayPrice);

  // Variant-specific availability: variant must exist + be active + have stock.
  // If no variant stored, fall back to product-level isActive.
  const isAvailable = variant
    ? (variant?.isActive !== false && (variant?.stockQuantity ?? 1) > 0)
    : product?.isActive;

  // Use variant image when available
  const displayImage = variant?.imageUrl || product?.imageUrl || '/assets/images/no_image.png';
  // Show variant color as a badge
  const variantColor = variant?.color || null;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <AppImage
          src={displayImage}
          alt={product?.name || 'Product image'}
          className="w-full h-full object-cover"
        />
        {variantColor && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {variantColor}
          </span>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      {/* Product Details */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase">{product?.category || 'Furniture'}</span>
          {product?.brand && (
            <span className="text-xs text-gray-500 ml-2">• {product?.brand}</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product?.name || 'Unnamed Product'}{variantColor ? ` — ${variantColor}` : ''}
        </h3>

        <p className="text-2xl font-bold text-blue-600 mb-4">
          {formattedPrice}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onAddToCart}
            disabled={!isAvailable || isAddingToCart}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
              isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700' :'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onViewDetails}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={onRemove}
              className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Added Date */}
        <p className="text-xs text-gray-500 mt-3">
          Added {new Date(item?.createdAt)?.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}

WishlistCard.propTypes = {
  item: PropTypes?.shape({
    id: PropTypes?.string,
    createdAt: PropTypes?.string,
    product: PropTypes?.shape({
      id: PropTypes?.string,
      name: PropTypes?.string,
      basePrice: PropTypes?.number,
      imageUrl: PropTypes?.string,
      category: PropTypes?.string,
      brand: PropTypes?.string,
      isActive: PropTypes?.bool,
      sku: PropTypes?.string
    })
  }),
  isSelected: PropTypes?.bool,
  onToggleSelect: PropTypes?.func,
  onRemove: PropTypes?.func,
  onAddToCart: PropTypes?.func,
  onViewDetails: PropTypes?.func,
  isAddingToCart: PropTypes?.bool
};