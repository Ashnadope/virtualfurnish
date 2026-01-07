'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '../../../components/ui/AppImage';

export default function ProductCard({ product }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const lowestPrice = product?.variants?.length > 0
    ? Math.min(...product?.variants?.map(v => parseFloat(v?.price || product?.basePrice || 0)))
    : parseFloat(product?.basePrice || 0);

  const totalStock = product?.variants?.length > 0
    ? product?.variants?.reduce((sum, v) => sum + (parseInt(v?.stockQuantity) || 0), 0)
    : 0;

  const isInStock = totalStock > 0;

  const handleCardClick = () => {
    router?.push(`/product/${product?.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(price);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gray-100">
        {!imageError ? (
          <AppImage
            src={product?.imageUrl || '/assets/images/no_image.png'}
            alt={product?.name || 'Product image'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isInStock ? (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
              In Stock
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>
      {/* Product Details */}
      <div className="p-4">
        {/* Brand */}
        {product?.brand && (
          <p className="text-sm text-gray-500 mb-1">
            {product?.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product?.name || 'Unnamed Product'}
        </h3>

        {/* Description */}
        {product?.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product?.description}
          </p>
        )}

        {/* Variants Info */}
        {product?.variants?.length > 0 && (
          <div className="mb-3 space-y-1">
            {/* Size Range */}
            {product?.variants?.some(v => v?.size) && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Size: </span>
                {product?.variants?.map(v => v?.size)?.filter(Boolean)?.join(', ')}
              </p>
            )}
            
            {/* Available Colors */}
            {product?.variants?.some(v => v?.color) && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Colors: </span>
                {[...new Set(product?.variants?.map(v => v?.color)?.filter(Boolean))]?.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(lowestPrice)}
            </p>
            {product?.variants?.length > 1 && (
              <p className="text-xs text-gray-500">
                Starting price
              </p>
            )}
          </div>
          
          {isInStock && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {totalStock} units
              </p>
              <p className="text-xs text-gray-500">
                Available
              </p>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <button
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={(e) => {
            e?.stopPropagation();
            handleCardClick();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string,
    brand: PropTypes?.string,
    description: PropTypes?.string,
    imageUrl: PropTypes?.string,
    basePrice: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number]),
    variants: PropTypes?.arrayOf(PropTypes?.shape({
      id: PropTypes?.string,
      name: PropTypes?.string,
      size: PropTypes?.string,
      color: PropTypes?.string,
      price: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number]),
      stockQuantity: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])
    }))
  })?.isRequired
};