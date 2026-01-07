'use client';

import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function CanvasArea({ 
  uploadedImage, 
  placedFurniture, 
  selectedFurnitureId,
  onFurnitureSelect,
  onFurnitureMove,
  onFurnitureRotate,
  onFurnitureScale,
  onFurnitureDelete,
  showAISuggestions,
  aiSuggestionType
}) {
  const [zoom, setZoom] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  const [draggedFurnitureId, setDraggedFurnitureId] = useState(null);
  const [furnitureDragStart, setFurnitureDragStart] = useState(null);
  const [rotationMode, setRotationMode] = useState(false);
  const [rotationStart, setRotationStart] = useState(null);
  const canvasRef = useRef(null);
  const imageContainerRef = useRef(null);

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
      onFurnitureSelect(furnitureId);
      
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
    if (!isDraggingFurniture && !rotationMode) {
      e?.stopPropagation();
      onFurnitureSelect(furnitureId);
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
      setIsDraggingFurniture(true);
      setDraggedFurnitureId(furnitureId);
      onFurnitureSelect(furnitureId);
      
      const furniture = placedFurniture?.find(f => f?.id === furnitureId);
      if (furniture && imageContainerRef?.current) {
        const rect = imageContainerRef?.current?.getBoundingClientRect();
        const touch = e?.touches?.[0];
        const offsetX = touch?.clientX - rect?.left - (furniture?.position?.x / 100) * rect?.width;
        const offsetY = touch?.clientY - rect?.top - (furniture?.position?.y / 100) * rect?.height;
        setFurnitureDragStart({ offsetX, offsetY, rect });
      }
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
      const newScale = Math.max(0.5, Math.min(2, rotationStart?.initialScale * scaleRatio));
      
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
      const rect = imageContainerRef?.current?.getBoundingClientRect();
      const touch = e?.touches?.[0];
      const newX = ((touch?.clientX - rect?.left - furnitureDragStart?.offsetX) / rect?.width) * 100;
      const newY = ((touch?.clientY - rect?.top - furnitureDragStart?.offsetY) / rect?.height) * 100;
      
      const boundedX = Math.max(0, Math.min(95, newX));
      const boundedY = Math.max(0, Math.min(95, newY));
      
      onFurnitureMove(draggedFurnitureId, { x: boundedX, y: boundedY });
    }
  };

  const handleFurnitureTouchEnd = () => {
    setIsDraggingFurniture(false);
    setDraggedFurnitureId(null);
    setFurnitureDragStart(null);
    setRotationMode(false);
    setRotationStart(null);
  };

  const selectedFurniture = placedFurniture?.find(f => f?.id === selectedFurnitureId);

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
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
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
            <div ref={imageContainerRef} className="relative">
              <AppImage
                src={uploadedImage}
                alt="Uploaded room photo showing walls and floor for furniture arrangement"
                className="max-w-full max-h-full object-contain select-none"
              />
              
              {showAISuggestions && (
                <div className="absolute inset-0 pointer-events-none">
                  {aiSuggestionType === 'layout' && (
                    <>
                      <div className="absolute top-[20%] left-[15%] w-32 h-24 border-2 border-dashed border-accent bg-accent/10 rounded-md flex items-center justify-center">
                        <span className="font-body text-xs text-accent-foreground bg-accent px-2 py-1 rounded">Sofa</span>
                      </div>
                      <div className="absolute top-[20%] right-[15%] w-20 h-20 border-2 border-dashed border-accent bg-accent/10 rounded-md flex items-center justify-center">
                        <span className="font-body text-xs text-accent-foreground bg-accent px-2 py-1 rounded">Table</span>
                      </div>
                      <div className="absolute bottom-[25%] left-[30%] w-24 h-16 border-2 border-dashed border-accent bg-accent/10 rounded-md flex items-center justify-center">
                        <span className="font-body text-xs text-accent-foreground bg-accent px-2 py-1 rounded">Chair</span>
                      </div>
                    </>
                  )}
                  
                  {aiSuggestionType === 'color' && (
                    <div className="absolute top-4 right-4 bg-surface/95 p-4 rounded-lg shadow-elevated">
                      <p className="font-heading font-semibold text-sm text-foreground mb-2">Recommended Colors</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-md bg-[#8B7355]" title="Warm Brown" />
                        <div className="w-8 h-8 rounded-md bg-[#E8DCC4]" title="Cream" />
                        <div className="w-8 h-8 rounded-md bg-[#4A5D4F]" title="Forest Green" />
                        <div className="w-8 h-8 rounded-md bg-[#D4A574]" title="Golden Oak" />
                      </div>
                    </div>
                  )}
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
                    selectedFurnitureId === furniture?.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:ring-2 hover:ring-primary/50'
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
                  {selectedFurnitureId === furniture?.id && (
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
        <div className="px-4 py-3 bg-surface border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                <AppImage
                  src={selectedFurniture?.image}
                  alt={selectedFurniture?.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-foreground">{selectedFurniture?.name}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {selectedFurniture?.category} • Scale: {(selectedFurniture?.scale * 100)?.toFixed(0)}% • Rotation: {selectedFurniture?.rotation}°
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onFurnitureRotate(selectedFurnitureId, -15)}
                className="p-2 rounded-md hover:bg-muted transition-fast"
                aria-label="Rotate left"
              >
                <Icon name="ArrowUturnLeftIcon" size={18} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureRotate(selectedFurnitureId, 15)}
                className="p-2 rounded-md hover:bg-muted transition-fast"
                aria-label="Rotate right"
              >
                <Icon name="ArrowUturnRightIcon" size={18} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureScale(selectedFurnitureId, 0.1)}
                className="p-2 rounded-md hover:bg-muted transition-fast"
                aria-label="Scale up"
              >
                <Icon name="PlusCircleIcon" size={18} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureScale(selectedFurnitureId, -0.1)}
                className="p-2 rounded-md hover:bg-muted transition-fast"
                aria-label="Scale down"
              >
                <Icon name="MinusCircleIcon" size={18} variant="outline" />
              </button>
              <button
                onClick={() => onFurnitureDelete(selectedFurnitureId)}
                className="p-2 rounded-md hover:bg-error/10 text-error transition-fast"
                aria-label="Delete furniture"
              >
                <Icon name="TrashIcon" size={18} variant="outline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  showAISuggestions: PropTypes?.bool?.isRequired,
  aiSuggestionType: PropTypes?.string
};