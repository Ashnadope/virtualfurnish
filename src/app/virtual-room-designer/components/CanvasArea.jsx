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
  const canvasRef = useRef(null);

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

  const handleMouseDown = (e) => {
    if (e?.button === 1 || (e?.button === 0 && e?.shiftKey)) {
      setIsPanning(true);
      setDragStart({ x: e?.clientX - panOffset?.x, y: e?.clientY - panOffset?.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && dragStart) {
      setPanOffset({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, dragStart]);

  const handleFurnitureClick = (furnitureId) => {
    onFurnitureSelect(furnitureId);
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
        onMouseDown={handleMouseDown}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {uploadedImage ? (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `scale(${zoom / 100}) translate(${panOffset?.x}px, ${panOffset?.y}px)`,
              transformOrigin: 'center center'
            }}
          >
            <div className="relative">
              <AppImage
                src={uploadedImage}
                alt="Uploaded room photo showing walls and floor for furniture arrangement"
                className="max-w-full max-h-full object-contain"
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
                  className={`absolute cursor-move ${selectedFurnitureId === furniture?.id ? 'ring-2 ring-primary' : ''}`}
                  style={{
                    left: `${furniture?.position?.x}%`,
                    top: `${furniture?.position?.y}%`,
                    width: `${furniture?.scale * 100}px`,
                    height: `${furniture?.scale * 80}px`,
                    transform: `rotate(${furniture?.rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                  onClick={() => handleFurnitureClick(furniture?.id)}
                >
                  <AppImage
                    src={furniture?.image}
                    alt={furniture?.alt}
                    className="w-full h-full object-contain"
                  />
                  {selectedFurnitureId === furniture?.id && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-body whitespace-nowrap">
                      {furniture?.name}
                    </div>
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
                <p className="font-body text-xs text-muted-foreground">{selectedFurniture?.category}</p>
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