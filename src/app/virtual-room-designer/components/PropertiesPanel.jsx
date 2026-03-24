'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function PropertiesPanel({ selectedFurniture, onAddToCart, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation after mount
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Lock body scroll while panel is open on mobile
  useEffect(() => {
    const isSmall = window.innerWidth < 1024;
    if (isSmall) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!selectedFurniture) {
    return (
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 z-[160] bg-surface border-r border-border flex flex-col items-center justify-center gap-3 overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:top-auto lg:left-auto lg:h-auto lg:w-80 lg:translate-x-0 lg:z-auto lg:border-r-0 lg:border-l
      `}>
        <Icon name="InformationCircleIcon" size={48} variant="outline" className="text-muted-foreground" />
        <p className="font-body text-sm text-muted-foreground text-center">
          Select a furniture item to view details
        </p>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(selectedFurniture);
  };

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className="lg:hidden fixed inset-0 bg-foreground/30 z-[155]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 z-[160] bg-surface border-r border-border flex flex-col overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:top-auto lg:left-auto lg:h-auto lg:w-80 lg:translate-x-0 lg:z-auto lg:border-r-0 lg:border-l
      `}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-heading font-semibold text-sm text-foreground">Properties</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-fast"
          aria-label="Close properties"
        >
          <Icon name="XMarkIcon" size={20} variant="outline" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
          <AppImage
            key={selectedFurniture?.id ?? selectedFurniture?.image}
            src={selectedFurniture?.image}
            alt={selectedFurniture?.alt}
            className="w-full h-full object-cover"
          />
        </div>

        <h4 className="font-heading font-semibold text-base text-foreground mb-1">
          {selectedFurniture?.name}
        </h4>
        <p className="font-body text-sm text-muted-foreground mb-4">
          {selectedFurniture?.category}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">Price</span>
            <span className="font-heading font-semibold text-lg text-primary">
              ₱{selectedFurniture?.price?.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">Dimensions</span>
            <span className="font-body text-sm text-foreground">
              {typeof selectedFurniture?.dimensions === 'object' && selectedFurniture?.dimensions !== null
                ? `${selectedFurniture.dimensions.width ?? ''}W × ${selectedFurniture.dimensions.length ?? ''}L × ${selectedFurniture.dimensions.height ?? ''}H cm`.replace(/undefined/g, '?')
                : selectedFurniture?.dimensions}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">Material</span>
            <span className="font-body text-sm text-foreground">{selectedFurniture?.material}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted-foreground">Stock</span>
            <span className={`font-body text-sm font-medium ${selectedFurniture?.stock > 5 ? 'text-success' : 'text-warning'}`}>
              {selectedFurniture?.stock} available
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={selectedFurniture?.stock === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="ShoppingCartIcon" size={20} variant="solid" />
          <span className="font-body font-medium">Add to Cart</span>
        </button>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="flex items-start gap-2">
            <Icon name="InformationCircleIcon" size={18} variant="solid" className="text-primary mt-0.5" />
            <p className="font-body text-xs text-foreground">
              Use the controls below the canvas to rotate, scale, or delete this furniture item from your design.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

PropertiesPanel.propTypes = {
  selectedFurniture: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    dimensions: PropTypes?.string?.isRequired,
    material: PropTypes?.string?.isRequired,
    stock: PropTypes?.number?.isRequired
  }),
  onAddToCart: PropTypes?.func?.isRequired,
  onClose: PropTypes?.func?.isRequired
};

