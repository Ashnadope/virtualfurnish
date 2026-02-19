'use client';

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function FurniturePalette({ furnitureItems, onAddFurniture }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  // Dynamically extract unique categories from furniture items
  const categories = useMemo(() => {
    if (!furnitureItems || furnitureItems.length === 0) {
      return ['All'];
    }
    
    const uniqueCategories = [...new Set(furnitureItems.map(item => item?.category).filter(Boolean))];
    return ['All', ...uniqueCategories.sort()];
  }, [furnitureItems]);

  const filteredFurniture = furnitureItems?.filter(item => {
    const matchesSearch = item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCanvas = (furniture) => {
    onAddFurniture(furniture);
  };

  const handleDragStart = (e, furniture) => {
    e?.dataTransfer?.setData('application/json', JSON.stringify(furniture));
    if (e?.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
    }
    
    const dragImage = e?.target?.querySelector('img') || e?.target;
    if (dragImage && e?.dataTransfer) {
      e.dataTransfer.setDragImage(dragImage, 50, 50);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsPaletteOpen(!isPaletteOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-overlay p-3 rounded-full bg-primary text-primary-foreground shadow-elevated"
        aria-label="Toggle furniture palette"
      >
        <Icon name={isPaletteOpen ? 'XMarkIcon' : 'Squares2X2Icon'} size={24} variant="solid" />
      </button>
      <div
        className={`
          fixed lg:relative top-0 right-0 h-full w-80 bg-surface border-l border-border z-sidebar
          transition-transform duration-300 ease-smooth
          ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-base text-foreground">Furniture Catalog</h2>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-muted transition-fast"
                aria-label="Close palette"
              >
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>

            <div className="relative">
              <Icon 
                name="MagnifyingGlassIcon" 
                size={18} 
                variant="outline" 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="px-4 py-3 border-b border-border overflow-x-auto">
            <div className="flex gap-2">
              {categories?.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-3 py-1.5 rounded-md font-body text-sm whitespace-nowrap transition-fast
                    ${selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredFurniture?.map((item) => (
                <div
                  key={item?.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-card transition-fast cursor-grab active:cursor-grabbing group"
                  onClick={() => handleAddToCanvas(item)}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <AppImage
                      src={item?.image}
                      alt={item?.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-fast pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-fast flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-fast bg-primary text-primary-foreground p-2 rounded-full">
                        <Icon name="PlusIcon" size={20} variant="solid" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="font-body font-medium text-xs text-foreground truncate">{item?.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{item?.category}</p>
                    <p className="font-heading font-semibold text-sm text-primary mt-1">₱{item?.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredFurniture?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Icon name="MagnifyingGlassIcon" size={48} variant="outline" className="text-muted-foreground" />
                <p className="font-body text-sm text-muted-foreground text-center">
                  No furniture found matching your search
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isPaletteOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-dropdown"
          onClick={() => setIsPaletteOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

FurniturePalette.propTypes = {
  furnitureItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    dimensions: PropTypes.string.isRequired,
    material: PropTypes.string.isRequired,
    stock: PropTypes.number.isRequired
  })).isRequired,
  onAddFurniture: PropTypes.func.isRequired
};