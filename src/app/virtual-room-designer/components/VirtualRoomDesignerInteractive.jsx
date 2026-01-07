'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CanvasArea from './CanvasArea';
import FurniturePalette from './FurniturePalette';
import ActionToolbar from './ActionToolbar';
import PropertiesPanel from './PropertiesPanel';
import AISuggestionControls from './AISuggestionControls';
import ImageUploadModal from './ImageUploadModal';
import Icon from '@/components/ui/AppIcon';

export default function VirtualRoomDesignerInteractive({ initialFurnitureData }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [placedFurniture, setPlacedFurniture] = useState([]);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestionType, setAiSuggestionType] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  useEffect(() => {
    const savedDesign = localStorage.getItem('virtualRoomDesign');
    if (savedDesign) {
      try {
        const design = JSON.parse(savedDesign);
        setUploadedImage(design?.image);
        setPlacedFurniture(design?.furniture || []);
      } catch (error) {
        console.error('Failed to load saved design:', error);
      }
    }
  }, []);

  const saveToHistory = (newState) => {
    const newHistory = history?.slice(0, historyIndex + 1);
    newHistory?.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory?.length - 1);
  };

  const handleImageUpload = (imageUrl) => {
    setUploadedImage(imageUrl);
    setPlacedFurniture([]);
    saveToHistory({ image: imageUrl, furniture: [] });
  };

  const handleAddFurniture = (furniture) => {
    const newFurniture = {
      ...furniture,
      id: `${furniture?.id}-${Date.now()}`,
      position: { x: 30, y: 30 },
      rotation: 0,
      scale: 1
    };
    const newPlacedFurniture = [...placedFurniture, newFurniture];
    setPlacedFurniture(newPlacedFurniture);
    setSelectedFurnitureId(newFurniture?.id);
    setShowPropertiesPanel(true);
    saveToHistory({ image: uploadedImage, furniture: newPlacedFurniture });
  };

  const handleFurnitureSelect = (furnitureId) => {
    setSelectedFurnitureId(furnitureId);
    setShowPropertiesPanel(true);
  };

  const handleFurnitureMove = (furnitureId, newPosition) => {
    const newPlacedFurniture = placedFurniture?.map(f =>
      f?.id === furnitureId ? { ...f, position: newPosition } : f
    );
    setPlacedFurniture(newPlacedFurniture);
    saveToHistory({ image: uploadedImage, furniture: newPlacedFurniture });
  };

  const handleFurnitureRotate = (furnitureId, angle) => {
    const newPlacedFurniture = placedFurniture?.map(f =>
      f?.id === furnitureId ? { ...f, rotation: (f?.rotation + angle) % 360 } : f
    );
    setPlacedFurniture(newPlacedFurniture);
    saveToHistory({ image: uploadedImage, furniture: newPlacedFurniture });
  };

  const handleFurnitureScale = (furnitureId, scaleChange) => {
    const newPlacedFurniture = placedFurniture?.map(f =>
      f?.id === furnitureId ? { ...f, scale: Math.max(0.5, Math.min(2, f?.scale + scaleChange)) } : f
    );
    setPlacedFurniture(newPlacedFurniture);
    saveToHistory({ image: uploadedImage, furniture: newPlacedFurniture });
  };

  const handleFurnitureDelete = (furnitureId) => {
    const newPlacedFurniture = placedFurniture?.filter(f => f?.id !== furnitureId);
    setPlacedFurniture(newPlacedFurniture);
    setSelectedFurnitureId(null);
    setShowPropertiesPanel(false);
    saveToHistory({ image: uploadedImage, furniture: newPlacedFurniture });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history?.[newIndex];
      setUploadedImage(state?.image);
      setPlacedFurniture(state?.furniture);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history?.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history?.[newIndex];
      setUploadedImage(state?.image);
      setPlacedFurniture(state?.furniture);
      setHistoryIndex(newIndex);
    }
  };

  const handleReset = () => {
    setPlacedFurniture([]);
    setSelectedFurnitureId(null);
    setShowPropertiesPanel(false);
    saveToHistory({ image: uploadedImage, furniture: [] });
  };

  const handleSave = () => {
    try {
      const design = {
        image: uploadedImage,
        furniture: placedFurniture,
        savedAt: new Date()?.toISOString()
      };
      localStorage.setItem('virtualRoomDesign', JSON.stringify(design));
      alert('Design saved successfully!');
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design. Please try again.');
    }
  };

  const handleExport = () => {
    alert('Export functionality will download your design as an image file.');
  };

  const handleGetLayoutSuggestions = () => {
    setIsProcessingAI(true);
    setTimeout(() => {
      setShowAISuggestions(true);
      setAiSuggestionType('layout');
      setIsProcessingAI(false);
    }, 2000);
  };

  const handleGetColorMatching = () => {
    setIsProcessingAI(true);
    setTimeout(() => {
      setShowAISuggestions(true);
      setAiSuggestionType('color');
      setIsProcessingAI(false);
    }, 2000);
  };

  const handleAddToCart = (furniture) => {
    const existingItem = cartItems?.find(item => item?.id === furniture?.id);
    if (existingItem) {
      setCartItems(cartItems?.map(item =>
        item?.id === furniture?.id ? { ...item, quantity: item?.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...furniture, quantity: 1 }]);
    }
    alert(`${furniture?.name} added to cart!`);
  };

  const selectedFurniture = placedFurniture?.find(f => f?.id === selectedFurnitureId);
  const selectedFurnitureDetails = selectedFurniture
    ? initialFurnitureData?.find(item => item?.id === selectedFurniture?.id?.split('-')?.[0])
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" userName="John Doe" />
      <main className="lg:ml-sidebar pt-16">
        <div className="p-6">
          <div className="mb-6">
            <Breadcrumb />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
                  Virtual Room Designer
                </h1>
                <p className="font-body text-muted-foreground">
                  Upload your room photo and arrange furniture with AI-powered suggestions
                </p>
              </div>

              {!uploadedImage && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast"
                >
                  <Icon name="CloudArrowUpIcon" size={20} variant="solid" />
                  <span className="font-body font-medium">Upload Room Photo</span>
                </button>
              )}
            </div>
          </div>

          {uploadedImage ? (
            <div className="flex flex-col gap-4">
              <ActionToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onReset={handleReset}
                onSave={handleSave}
                onExport={handleExport}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history?.length - 1}
                hasChanges={placedFurniture?.length > 0}
              />

              <AISuggestionControls
                onGetLayoutSuggestions={handleGetLayoutSuggestions}
                onGetColorMatching={handleGetColorMatching}
                isProcessing={isProcessingAI}
              />

              <div className="flex gap-4">
                <CanvasArea
                  uploadedImage={uploadedImage}
                  placedFurniture={placedFurniture}
                  selectedFurnitureId={selectedFurnitureId}
                  onFurnitureSelect={handleFurnitureSelect}
                  onFurnitureMove={handleFurnitureMove}
                  onFurnitureRotate={handleFurnitureRotate}
                  onFurnitureScale={handleFurnitureScale}
                  onFurnitureDelete={handleFurnitureDelete}
                  showAISuggestions={showAISuggestions}
                  aiSuggestionType={aiSuggestionType}
                />

                <FurniturePalette
                  furnitureItems={initialFurnitureData}
                  onAddFurniture={handleAddFurniture}
                />

                {showPropertiesPanel && selectedFurnitureDetails && (
                  <PropertiesPanel
                    selectedFurniture={selectedFurnitureDetails}
                    onAddToCart={handleAddToCart}
                    onClose={() => setShowPropertiesPanel(false)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-lg border border-border p-12 text-center">
              <Icon name="PhotoIcon" size={96} variant="outline" className="mx-auto mb-6 text-muted-foreground" />
              <h2 className="font-heading font-semibold text-xl text-foreground mb-3">
                Start Your Room Design
              </h2>
              <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">
                Upload a photo of your room to begin arranging furniture. Our AI will detect walls and floors automatically.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast"
              >
                <Icon name="CloudArrowUpIcon" size={20} variant="solid" />
                <span className="font-body font-medium">Upload Room Photo</span>
              </button>
            </div>
          )}
        </div>
      </main>
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleImageUpload}
      />
    </div>
  );
}

VirtualRoomDesignerInteractive.propTypes = {
  initialFurnitureData: PropTypes?.arrayOf(PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    name: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    image: PropTypes?.string?.isRequired,
    alt: PropTypes?.string?.isRequired,
    price: PropTypes?.number?.isRequired,
    dimensions: PropTypes?.string?.isRequired,
    material: PropTypes?.string?.isRequired,
    stock: PropTypes?.number?.isRequired
  }))?.isRequired
};