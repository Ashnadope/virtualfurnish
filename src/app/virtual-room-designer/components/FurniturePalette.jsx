'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function FurniturePalette({ furnitureItems, onAddFurniture, isOpen: externalIsOpen, onToggle, aiRecs = [] }) {
  const LONG_PRESS_MS = 280;
  const MOVE_TOLERANCE_PX = 8;
  const DRAG_THRESHOLD_PX = 14;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [internalOpen, setInternalOpen] = useState(false);
  // Touch drag state for drag-from-catalog-to-canvas on mobile
  const touchDragStateRef = useRef(null); // { item, startX, startY, ghost, longPressReady, cancelled, longPressTimer }
  const didTouchDragRef = useRef(false);

  const isPaletteOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;

  const setIsPaletteOpen = (val) => {
    setInternalOpen(val);
    onToggle?.(val);
  };

  // Lock body scroll while palette is open on mobile
  useEffect(() => {
    const isSmall = window.innerWidth < 1024;
    if (isPaletteOpen && isSmall) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isPaletteOpen]);

  // Build a map from furniture/product ID → { priority weight, reason } for AI-recommended items
  const aiRecMap = useMemo(() => {
    const PRIORITY = { high: 3, medium: 2, low: 1 };
    const map = new Map();
    aiRecs.forEach(rec => {
      const weight = PRIORITY[rec?.priority] ?? 0;
      if (rec?.furnitureId) map.set(rec.furnitureId, { weight, reason: rec?.reason });
    });
    return map;
  }, [aiRecs]);

  // Dynamically extract unique categories from furniture items
  const categories = useMemo(() => {
    if (!furnitureItems || furnitureItems.length === 0) {
      return ['All'];
    }
    
    const uniqueCategories = [...new Set(furnitureItems.map(item => item?.category).filter(Boolean))];
    return ['All', ...uniqueCategories.sort()];
  }, [furnitureItems]);

  const filteredFurniture = useMemo(() => {
    const filtered = furnitureItems?.filter(item => {
      const matchesSearch = item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) ?? [];

    // Sort: AI-recommended items first (high → medium → low), then alphabetical
    return [...filtered].sort((a, b) => {
      const wa = aiRecMap.get(a?.id)?.weight ?? aiRecMap.get(a?.productId)?.weight ?? 0;
      const wb = aiRecMap.get(b?.id)?.weight ?? aiRecMap.get(b?.productId)?.weight ?? 0;
      if (wb !== wa) return wb - wa;
      return (a?.name ?? '').localeCompare(b?.name ?? '');
    });
  }, [furnitureItems, searchQuery, selectedCategory, aiRecMap]);

  const handleAddToCanvas = (furniture) => {
    if (didTouchDragRef.current) {
      didTouchDragRef.current = false;
      return; // drag already placed item on canvas
    }
    onAddFurniture(furniture);
    setIsPaletteOpen(false); // close palette overlay on mobile after tap-to-add
  };

  // Build and inject a ghost element that follows the finger during cross-component touch drag
  const createGhostElement = (item, clientX, clientY) => {
    const ghost = document.createElement('div');
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${clientX - 35}px`,
      top: `${clientY - 35}px`,
      width: '70px',
      height: '70px',
      borderRadius: '8px',
      border: '2px solid #4f46e5',
      background: 'white',
      pointerEvents: 'none',
      zIndex: '9999',
      opacity: '0.9',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      overflow: 'hidden',
    });
    if (item?.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      ghost.appendChild(img);
    }
    document.body.appendChild(ghost);
    return ghost;
  };

  const handleItemTouchStart = (e, item) => {
    const touch = e.touches[0];
    didTouchDragRef.current = false;
    const state = {
      item,
      startX: touch.clientX,
      startY: touch.clientY,
      ghost: null,
      longPressReady: false,
      cancelled: false,
      longPressTimer: null,
    };

    state.longPressTimer = setTimeout(() => {
      if (!state.cancelled) {
        state.longPressReady = true;
      }
    }, LONG_PRESS_MS);

    touchDragStateRef.current = state;
  };

  const handleItemTouchMove = (e, item) => {
    if (!touchDragStateRef.current) return;

    const touch = e.touches[0];
    const state = touchDragStateRef.current;
    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const travel = Math.hypot(dx, dy);

    // Before long-press triggers, prioritize native vertical scrolling.
    if (!state.longPressReady && travel > MOVE_TOLERANCE_PX) {
      if (absY > absX) {
        state.cancelled = true;
        if (state.longPressTimer) {
          clearTimeout(state.longPressTimer);
          state.longPressTimer = null;
        }
        return;
      }
    }

    // Start drag only after long-press is armed and movement is intentional.
    if (!state.ghost && state.longPressReady && travel > DRAG_THRESHOLD_PX) {
      state.ghost = createGhostElement(item, touch.clientX, touch.clientY);
      didTouchDragRef.current = true;
    }

    if (state.ghost) {
      e.preventDefault(); // stop page scroll while cross-component dragging
      e.stopPropagation();
      state.ghost.style.left = `${touch.clientX - 35}px`;
      state.ghost.style.top = `${touch.clientY - 35}px`;
    }
  };

  const handleItemTouchEnd = (e, item) => {
    const state = touchDragStateRef.current;
    touchDragStateRef.current = null;
    if (state?.longPressTimer) {
      clearTimeout(state.longPressTimer);
    }
    if (!state?.ghost) return;
    document.body.removeChild(state.ghost);
    const touch = e.changedTouches[0];
    const imageContainer = document.querySelector('[data-canvas-image-container="true"]');
    if (imageContainer) {
      const rect = imageContainer.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top  && touch.clientY <= rect.bottom
      ) {
        const pctX = ((touch.clientX - rect.left) / rect.width) * 100;
        const pctY = ((touch.clientY - rect.top) / rect.height) * 100;
        onAddFurniture(item, {
          x: Math.max(0, Math.min(95, pctX)),
          y: Math.max(0, Math.min(95, pctY)),
        });
        setIsPaletteOpen(false);
      }
    }
  };

  const handleItemTouchCancel = () => {
    const state = touchDragStateRef.current;
    touchDragStateRef.current = null;
    if (state?.longPressTimer) {
      clearTimeout(state.longPressTimer);
    }
    if (state?.ghost) {
      document.body.removeChild(state.ghost);
    }
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
        className="lg:hidden fixed bottom-20 right-4 z-[170] p-2.5 rounded-full bg-primary text-primary-foreground shadow-elevated"
        aria-label="Toggle furniture palette"
      >
        <Icon name={isPaletteOpen ? 'XMarkIcon' : 'Squares2X2Icon'} size={20} variant="solid" />
      </button>
      <div
        className={`
          fixed lg:relative top-16 right-0 h-[calc(100vh-4rem)] lg:top-auto lg:h-full w-80 bg-surface border-l border-border z-[160] lg:z-auto
          transition-transform duration-300 ease-smooth
          ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
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
                className="w-full pl-10 pr-3 sm:pr-4 py-2 rounded-md border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border overflow-x-auto">
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

          <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ overscrollBehavior: 'contain' }}>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {filteredFurniture?.map((item) => {
                const aiRec = aiRecMap.get(item?.id) ?? aiRecMap.get(item?.productId);
                return (
                <div
                  key={item?.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-card transition-fast cursor-grab active:cursor-grabbing group"
                  onClick={() => handleAddToCanvas(item)}
                  onTouchStart={(e) => handleItemTouchStart(e, item)}
                  onTouchMove={(e) => handleItemTouchMove(e, item)}
                  onTouchEnd={(e) => handleItemTouchEnd(e, item)}
                  onTouchCancel={handleItemTouchCancel}
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
                    {aiRec && (
                      <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-body font-semibold leading-tight ${
                        aiRec.weight === 3 ? 'bg-primary text-primary-foreground' :
                        aiRec.weight === 2 ? 'bg-amber-500 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {aiRec.weight === 3 ? '★ AI Pick' : aiRec.weight === 2 ? '✦ Suggested' : '· Consider'}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-body font-medium text-xs text-foreground truncate">{item?.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{item?.category}</p>
                    <p className="font-heading font-semibold text-sm text-primary mt-1">₱{item?.price?.toLocaleString()}</p>
                  </div>
                </div>
                );
              })}
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
          className="lg:hidden fixed inset-0 bg-foreground/50 z-[155]"
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
  onAddFurniture: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  aiRecs: PropTypes.arrayOf(PropTypes.shape({
    furnitureId: PropTypes.string,
    priority: PropTypes.string,
    reason: PropTypes.string,
  })),
};