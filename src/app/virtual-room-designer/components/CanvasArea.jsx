'use client';

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const CanvasArea = forwardRef(function CanvasArea({ 
  uploadedImage, 
  placedFurniture, 
  selectedFurnitureId,
  onFurnitureSelect,
  onFurnitureMove,
  onFurnitureRotate,
  onFurnitureScale,
  onFurnitureDelete,
  onAddFurniture,
  onCanvasDeselect,
  showAISuggestions,
  aiSuggestionType,
  colorPalette
}, ref) {
  const [colorPaletteDismissed, setColorPaletteDismissed] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  // Reset dismissed state when the overlay is re-triggered
  useEffect(() => {
    if (showAISuggestions && aiSuggestionType === 'color') {
      setColorPaletteDismissed(false);
    }
  }, [showAISuggestions, aiSuggestionType]);

  const [zoom, setZoom] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  const [draggedFurnitureId, setDraggedFurnitureId] = useState(null);
  const [furnitureDragStart, setFurnitureDragStart] = useState(null);
  const [rotationMode, setRotationMode] = useState(false);
  const [rotationStart, setRotationStart] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const canvasRef = useRef(null);
  const imageContainerRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const touchStartPosRef = useRef(null);
  const didDragRef = useRef(false);

  // Expose capture function to parent via ref
  useImperativeHandle(ref, () => ({
    captureCanvas: async () => {
      if (!imageContainerRef.current) {
        throw new Error('Canvas not ready');
      }

      try {
        // Hide selection UI before capture so the exported image is clean
        flushSync(() => setIsCapturing(true));

        const container = imageContainerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Expand capture area to include furniture that overflows the container bounds
        let extraRight = 0;
        let extraBottom = 0;
        container.querySelectorAll('[data-furniture-id]').forEach(el => {
          const r = el.getBoundingClientRect();
          extraRight = Math.max(extraRight, r.right - containerRect.right);
          extraBottom = Math.max(extraBottom, r.bottom - containerRect.bottom);
        });

        const canvas = await html2canvas(container, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: containerRect.width + Math.max(0, extraRight),
          height: containerRect.height + Math.max(0, extraBottom),
        });

        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob'));
            },
            'image/png',
            0.95
          );
        });
      } catch (error) {
        console.error('Error capturing canvas:', error);
        throw error;
      } finally {
        setIsCapturing(false);
      }
    }
  }));

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCanvasMouseDown = (e) => {
    if (e?.button === 1 || (e?.button === 0 && e?.shiftKey && !e?.target?.closest('[data-furniture-id]'))) {
      e?.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e?.clientX - panOffset?.x, y: e?.clientY - panOffset?.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning && dragStart) {
      setPanOffset({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, dragStart, panOffset]);

  const handleFurnitureMouseDown = (e, furnitureId) => {
    e?.stopPropagation();
    
    if (e?.ctrlKey || e?.metaKey) {
      setRotationMode(true);
      setDraggedFurnitureId(furnitureId);
      const furniture = placedFurniture?.find(f => f?.id === furnitureId);
      if (furniture && imageContainerRef?.current) {
        const rect = imageContainerRef?.current?.getBoundingClientRect();
        const centerX = rect?.left + (furniture?.position?.x / 100) * rect?.width;
        const centerY = rect?.top + (furniture?.position?.y / 100) * rect?.height;
        const angle = Math.atan2(e?.clientY - centerY, e?.clientX - centerX) * (180 / Math.PI);
        setRotationStart({ angle, initialRotation: furniture?.rotation });
      }
    } else {
      setIsDraggingFurniture(true);
      setDraggedFurnitureId(furnitureId);
      didDragRef.current = false;
      onFurnitureSelect(furnitureId, false);
      
      const furniture = placedFurniture?.find(f => f?.id === furnitureId);
      if (furniture && imageContainerRef?.current) {
        const rect = imageContainerRef?.current?.getBoundingClientRect();
        const offsetX = e?.clientX - rect?.left - (furniture?.position?.x / 100) * rect?.width;
        const offsetY = e?.clientY - rect?.top - (furniture?.position?.y / 100) * rect?.height;
        setFurnitureDragStart({ offsetX, offsetY, rect });
      }
    }
  };

  const handleFurnitureMouseMove = (e) => {
    if (isDraggingFurniture && draggedFurnitureId && furnitureDragStart && imageContainerRef?.current) {
      e?.preventDefault();
      didDragRef.current = true;
      const rect = imageContainerRef?.current?.getBoundingClientRect();
      const newX = ((e?.clientX - rect?.left - furnitureDragStart?.offsetX) / rect?.width) * 100;
      const newY = ((e?.clientY - rect?.top - furnitureDragStart?.offsetY) / rect?.height) * 100;
      
      const boundedX = Math.max(0, Math.min(95, newX));
      const boundedY = Math.max(0, Math.min(95, newY));
      
      onFurnitureMove(draggedFurnitureId, { x: boundedX, y: boundedY });
    } else if (rotationMode && draggedFurnitureId && rotationStart && imageContainerRef?.current) {
      e?.preventDefault();
      const rect = imageContainerRef?.current?.getBoundingClientRect();
      const furniture = placedFurniture?.find(f => f?.id === draggedFurnitureId);
      if (furniture) {
        const centerX = rect?.left + (furniture?.position?.x / 100) * rect?.width;
        const centerY = rect?.top + (furniture?.position?.y / 100) * rect?.height;
        const currentAngle = Math.atan2(e?.clientY - centerY, e?.clientX - centerX) * (180 / Math.PI);
        const angleDiff = currentAngle - rotationStart?.angle;
        const newRotation = (rotationStart?.initialRotation + angleDiff + 360) % 360;
        
        const snappedRotation = Math.round(newRotation / 15) * 15;
        
        const currentFurniture = placedFurniture?.find(f => f?.id === draggedFurnitureId);
        if (currentFurniture && currentFurniture?.rotation !== snappedRotation) {
          onFurnitureRotate(draggedFurnitureId, snappedRotation - currentFurniture?.rotation);
        }
      }
    }
  };

  const handleFurnitureMouseUp = () => {
    setIsDraggingFurniture(false);
    setDraggedFurnitureId(null);
    setFurnitureDragStart(null);
    setRotationMode(false);
    setRotationStart(null);
  };

  useEffect(() => {
    if (isDraggingFurniture || rotationMode) {
      document.addEventListener('mousemove', handleFurnitureMouseMove);
      document.addEventListener('mouseup', handleFurnitureMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleFurnitureMouseMove);
        document.removeEventListener('mouseup', handleFurnitureMouseUp);
      };
    }
  }, [isDraggingFurniture, rotationMode, draggedFurnitureId, furnitureDragStart, rotationStart, placedFurniture]);

  const handleFurnitureWheel = (e, furnitureId) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (e?.ctrlKey || e?.metaKey) {
      const scaleChange = e?.deltaY > 0 ? -0.05 : 0.05;
      onFurnitureScale(furnitureId, scaleChange);
    } else {
      const rotationChange = e?.deltaY > 0 ? 15 : -15;
      onFurnitureRotate(furnitureId, rotationChange);
    }
  };

  const handleFurnitureClick = (e, furnitureId) => {
    if (!rotationMode && !didDragRef.current) {
      e?.stopPropagation();
      onFurnitureSelect(furnitureId, true);
    }
  };

  const handleFurnitureTouchStart = (e, furnitureId) => {
    e?.stopPropagation();
    
    if (e?.touches?.length === 2) {
      setRotationMode(true);
      setDraggedFurnitureId(furnitureId);
      const touch1 = e?.touches?.[0];
      const touch2 = e?.touches?.[1];
      const centerX = (touch1?.clientX + touch2?.clientX) / 2;
      const centerY = (touch1?.clientY + touch2?.clientY) / 2;
      const angle = Math.atan2(touch2?.clientY - touch1?.clientY, touch2?.clientX - touch1?.clientX) * (180 / Math.PI);
      const distance = Math.hypot(touch2?.clientX - touch1?.clientX, touch2?.clientY - touch1?.clientY);
      
      const furniture = placedFurniture?.find(f => f?.id === furnitureId);
      setRotationStart({ 
        angle, 
        initialRotation: furniture?.rotation || 0,
        centerX,
        centerY,
        initialDistance: distance,
        initialScale: furniture?.scale || 1
      });
    } else if (e?.touches?.length === 1) {
      const touch = e?.touches?.[0];
      touchStartPosRef.current = { x: touch?.clientX, y: touch?.clientY };
      setIsDraggingFurniture(true);
      setDraggedFurnitureId(furnitureId);
      // Select without opening properties — long press (500 ms) will open the panel
      onFurnitureSelect(furnitureId, false);

      const furniture = placedFurniture?.find(f => f?.id === furnitureId);
      if (furniture && imageContainerRef?.current) {
        const rect = imageContainerRef?.current?.getBoundingClientRect();
        const offsetX = touch?.clientX - rect?.left - (furniture?.position?.x / 100) * rect?.width;
        const offsetY = touch?.clientY - rect?.top - (furniture?.position?.y / 100) * rect?.height;
        setFurnitureDragStart({ offsetX, offsetY, rect });
      }
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = setTimeout(() => {
        onFurnitureSelect(furnitureId, true);
      }, 500);
    }
  };

  const handleFurnitureTouchMove = (e) => {
    e?.preventDefault();
    
    if (e?.touches?.length === 2 && rotationMode && draggedFurnitureId && rotationStart) {
      const touch1 = e?.touches?.[0];
      const touch2 = e?.touches?.[1];
      const currentAngle = Math.atan2(touch2?.clientY - touch1?.clientY, touch2?.clientX - touch1?.clientX) * (180 / Math.PI);
      const angleDiff = currentAngle - rotationStart?.angle;
      const newRotation = (rotationStart?.initialRotation + angleDiff + 360) % 360;
      
      const currentDistance = Math.hypot(touch2?.clientX - touch1?.clientX, touch2?.clientY - touch1?.clientY);
      const scaleRatio = currentDistance / rotationStart?.initialDistance;
      const newScale = Math.max(0.5, Math.min(3, rotationStart?.initialScale * scaleRatio));
      
      const furniture = placedFurniture?.find(f => f?.id === draggedFurnitureId);
      if (furniture) {
        const snappedRotation = Math.round(newRotation / 15) * 15;
        if (furniture?.rotation !== snappedRotation) {
          onFurnitureRotate(draggedFurnitureId, snappedRotation - furniture?.rotation);
        }
        if (Math.abs(furniture?.scale - newScale) > 0.01) {
          onFurnitureScale(draggedFurnitureId, newScale - furniture?.scale);
        }
      }
    } else if (e?.touches?.length === 1 && isDraggingFurniture && draggedFurnitureId && furnitureDragStart && imageContainerRef?.current) {
      const touch = e?.touches?.[0];
      // Cancel long-press if the finger moved significantly
      if (touchStartPosRef.current) {
        const dx = touch?.clientX - touchStartPosRef.current.x;
        const dy = touch?.clientY - touchStartPosRef.current.y;
        if (Math.hypot(dx, dy) > 10) clearTimeout(longPressTimerRef.current);
      }
      const rect = imageContainerRef?.current?.getBoundingClientRect();
      const newX = ((touch?.clientX - rect?.left - furnitureDragStart?.offsetX) / rect?.width) * 100;
      const newY = ((touch?.clientY - rect?.top - furnitureDragStart?.offsetY) / rect?.height) * 100;
      
      const boundedX = Math.max(0, Math.min(95, newX));
      const boundedY = Math.max(0, Math.min(95, newY));
      
      onFurnitureMove(draggedFurnitureId, { x: boundedX, y: boundedY });
    }
  };

  const handleFurnitureTouchEnd = () => {
    clearTimeout(longPressTimerRef.current);
    touchStartPosRef.current = null;
    setIsDraggingFurniture(false);
    setDraggedFurnitureId(null);
    setFurnitureDragStart(null);
    setRotationMode(false);
    setRotationStart(null);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    
    try {
      const furnitureData = e?.dataTransfer?.getData('application/json');
      if (furnitureData) {
        const furniture = JSON.parse(furnitureData);
        
        if (imageContainerRef?.current) {
          const rect = imageContainerRef?.current?.getBoundingClientRect();
          const x = ((e?.clientX - rect?.left) / rect?.width) * 100;
          const y = ((e?.clientY - rect?.top) / rect?.height) * 100;
          
          const boundedX = Math.max(0, Math.min(95, x));
          const boundedY = Math.max(0, Math.min(95, y));
          
          // Call onAddFurniture with furniture data and position
          onAddFurniture(furniture, { x: boundedX, y: boundedY });
        }
      }
    } catch (error) {
      console.error('Error dropping furniture:', error);
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (e?.currentTarget === e?.target || !e?.currentTarget?.contains(e?.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const selectedFurniture = placedFurniture?.find(f => f?.id === selectedFurnitureId);

  const getPaletteCardBackground = () => {
    const hexValues = Object.values(colorPalette || {}).filter(
      (value) => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)
    );

    if (!hexValues.length) {
      return 'rgba(255, 255, 255, 0.96)';
    }

    const hex = hexValues[0].replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Blend toward white so text remains readable regardless of source color.
    const blend = (channel) => Math.round(channel * 0.18 + 255 * 0.82);
    return `rgba(${blend(r)}, ${blend(g)}, ${blend(b)}, 0.98)`;
  };

  return (
    <div className="flex-1 flex flex-col bg-muted rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="CubeIcon" size={20} variant="solid" className="text-primary" />
          <span className="font-heading font-semibold text-sm text-foreground">Design Canvas</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mr-4">
            <span>💡 Drag to move • Ctrl+Drag to rotate • Scroll to scale</span>
          </div>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md hover:bg-muted transition-fast"
            aria-label="Zoom out"
          >
            <Icon name="MinusIcon" size={18} variant="outline" />
          </button>
          <span className="font-body text-sm text-foreground min-w-[60px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md hover:bg-muted transition-fast"
            aria-label="Zoom in"
          >
            <Icon name="PlusIcon" size={18} variant="outline" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-md hover:bg-muted transition-fast"
            aria-label="Reset zoom"
          >
            <Icon name="ArrowPathIcon" size={18} variant="outline" />
          </button>
        </div>
      </div>
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-move"
        onMouseDown={handleCanvasMouseDown}
        onClick={(e) => {
          // If click target is the canvas background (not a furniture item), deselect
          if (!e.target.closest('[data-furniture-id]')) {
            onCanvasDeselect?.();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        {uploadedImage ? (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `scale(${zoom / 100}) translate(${panOffset?.x}px, ${panOffset?.y}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <div 
              ref={imageContainerRef}
              data-canvas-image-container="true"
              className={`relative ${isDragOver ? 'ring-4 ring-primary/50 ring-inset' : ''}`}
            >
              <AppImage
                src={uploadedImage}
                alt="Uploaded room photo showing walls and floor for furniture arrangement"
                className="max-w-full max-h-full object-contain select-none"
              />
              
              {isDragOver && (
                <div className="absolute inset-0 bg-primary/10 pointer-events-none flex items-center justify-center">
                  <div className="bg-surface/95 px-6 py-3 rounded-lg shadow-elevated">
                    <p className="font-body font-medium text-foreground flex items-center gap-2">
                      <Icon name="CursorArrowRaysIcon" size={20} variant="solid" className="text-primary" />
                      Drop furniture here
                    </p>
                  </div>
                </div>
              )}
              
                {showAISuggestions && aiSuggestionType === 'color' && !colorPaletteDismissed && colorPalette && (
                  <div
                    className="absolute top-4 right-4 z-50 border border-border rounded-lg shadow-elevated pointer-events-auto backdrop-blur-sm"
                    style={{ minWidth: '180px', backgroundColor: getPaletteCardBackground() }}
                  >
                      <div className="flex items-center justify-between px-3 pt-3 pb-2">
                        <p className="font-heading font-semibold text-sm text-foreground">Recommended Palette</p>
                        <button
                          onClick={() => setColorPaletteDismissed(true)}
                          className="text-muted-foreground hover:text-foreground transition-fast ml-2"
                          aria-label="Dismiss color palette"
                        >
                          <Icon name="XMarkIcon" size={16} variant="solid" />
                        </button>
                      </div>
                      <div className="px-3 pb-3 flex flex-col gap-2">
                        {Object.entries(colorPalette).map(([name, hexCode]) => (
                          <div key={name} className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-md border border-border flex-shrink-0"
                              style={{ backgroundColor: hexCode }}
                              title={hexCode}
                            />
                            <div>
                              <p className="font-body text-xs font-medium text-foreground capitalize">{name}</p>
                              <p className="font-body text-xs text-muted-foreground">{hexCode}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

              {placedFurniture?.map((furniture) => (
                <div
                  key={furniture?.id}
                  data-furniture-id={furniture?.id}
                  className={`absolute select-none ${
                    isDraggingFurniture && draggedFurnitureId === furniture?.id 
                      ? 'cursor-grabbing' :'cursor-grab'
                  } ${
                    !isCapturing && selectedFurnitureId === furniture?.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : !isCapturing
                        ? 'hover:ring-2 hover:ring-primary/50'
                        : ''
                  } transition-shadow`}
                  style={{
                    left: `${furniture?.position?.x}%`,
                    top: `${furniture?.position?.y}%`,
                    width: `${furniture?.scale * 100}px`,
                    height: `${furniture?.scale * 80}px`,
                    transform: `rotate(${furniture?.rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: isDraggingFurniture && draggedFurnitureId === furniture?.id ? 'none' : 'transform 0.15s ease-out'
                  }}
                  onMouseDown={(e) => handleFurnitureMouseDown(e, furniture?.id)}
                  onClick={(e) => handleFurnitureClick(e, furniture?.id)}
                  onWheel={(e) => handleFurnitureWheel(e, furniture?.id)}
                  onTouchStart={(e) => handleFurnitureTouchStart(e, furniture?.id)}
                  onTouchMove={handleFurnitureTouchMove}
                  onTouchEnd={handleFurnitureTouchEnd}
                >
                  <AppImage
                    src={furniture?.image}
                    alt={furniture?.alt}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  {!isCapturing && selectedFurnitureId === furniture?.id && (
                    <>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-body whitespace-nowrap z-10">
                        {furniture?.name}
                      </div>
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            onFurnitureRotate(furniture?.id, 45);
                          }}
                          className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-fast shadow-md"
                          aria-label="Rotate"
                        >
                          <Icon name="ArrowPathIcon" size={12} variant="solid" />
                        </button>
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            onFurnitureScale(furniture?.id, 0.1);
                          }}
                          className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-fast shadow-md"
                          aria-label="Scale up"
                        >
                          <Icon name="PlusIcon" size={12} variant="solid" />
                        </button>
                      </div>
                      <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded pointer-events-none" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Icon name="PhotoIcon" size={64} variant="outline" className="text-muted-foreground" />
            <p className="font-body text-muted-foreground text-center">
              Upload a room photo to start designing
            </p>
          </div>
        )}
      </div>
      {selectedFurniture && (
        <div className="px-4 py-2.5 bg-surface border-t border-border">
          <div className="grid grid-cols-[3.5rem,1fr] grid-rows-2 gap-x-3 gap-y-0.5 sm:grid-cols-[3rem,minmax(0,1fr),auto] sm:grid-rows-1 sm:items-center sm:gap-y-0">
            <div className="row-span-2 self-stretch w-14 rounded-md overflow-hidden bg-muted sm:row-span-1 sm:self-center sm:w-11 sm:h-11">
              <AppImage
                key={selectedFurniture?.id ?? selectedFurniture?.image}
                src={selectedFurniture?.image}
                alt={selectedFurniture?.alt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 col-start-2 row-start-1 text-left sm:col-start-2 sm:row-start-1 sm:pr-3">
              <p className="font-heading font-semibold text-sm text-foreground truncate">{selectedFurniture?.name}</p>
            </div>

            <div className="col-start-2 row-start-2 grid grid-cols-5 gap-2 justify-items-start sm:col-start-3 sm:row-start-1 sm:flex sm:items-center sm:justify-start sm:gap-2">
              <button
                onClick={() => onFurnitureRotate(selectedFurnitureId, -15)}
                className="h-8 w-full flex items-center justify-center rounded-md hover:bg-muted transition-fast sm:h-auto sm:w-auto sm:p-2"
                aria-label="Rotate left"
              >
                <Icon name="ArrowUturnLeftIcon" size={16} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureRotate(selectedFurnitureId, 15)}
                className="h-8 w-full flex items-center justify-center rounded-md hover:bg-muted transition-fast sm:h-auto sm:w-auto sm:p-2"
                aria-label="Rotate right"
              >
                <Icon name="ArrowUturnRightIcon" size={16} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureScale(selectedFurnitureId, 0.1)}
                className="h-8 w-full flex items-center justify-center rounded-md hover:bg-muted transition-fast sm:h-auto sm:w-auto sm:p-2"
                aria-label="Scale up"
              >
                <Icon name="PlusCircleIcon" size={16} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureScale(selectedFurnitureId, -0.1)}
                className="h-8 w-full flex items-center justify-center rounded-md hover:bg-muted transition-fast sm:h-auto sm:w-auto sm:p-2"
                aria-label="Scale down"
              >
                <Icon name="MinusCircleIcon" size={16} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureDelete(selectedFurnitureId)}
                className="h-8 w-full flex items-center justify-center rounded-md hover:bg-error/10 text-error transition-fast sm:h-auto sm:w-auto sm:p-2"
                aria-label="Delete furniture"
              >
                <Icon name="TrashIcon" size={16} variant="outline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CanvasArea.propTypes = {
  uploadedImage: PropTypes?.string,
  placedFurniture: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
    position: PropTypes?.shape({
      x: PropTypes?.number?.isRequired,
      y: PropTypes?.number?.isRequired
    })?.isRequired,
    rotation: PropTypes?.number?.isRequired,
    scale: PropTypes?.number?.isRequired
  }))?.isRequired,
  selectedFurnitureId: PropTypes?.string,
  onFurnitureSelect: PropTypes?.func?.isRequired,
  onFurnitureMove: PropTypes?.func?.isRequired,
  onFurnitureRotate: PropTypes?.func?.isRequired,
  onFurnitureScale: PropTypes?.func?.isRequired,
  onFurnitureDelete: PropTypes?.func?.isRequired,
  onAddFurniture: PropTypes?.func?.isRequired,
  onCanvasDeselect: PropTypes?.func,
  showAISuggestions: PropTypes?.bool?.isRequired,
  aiSuggestionType: PropTypes?.string,
  colorPalette: PropTypes?.object
};

export default CanvasArea;