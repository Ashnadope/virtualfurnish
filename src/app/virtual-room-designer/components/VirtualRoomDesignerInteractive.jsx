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
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

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

  const handleImageUpload = async (imageUrl) => {
    setUploadedImage(imageUrl);
    setPlacedFurniture([]);
    saveToHistory({ image: imageUrl, furniture: [] });
    
    // Automatically trigger AI analysis after image upload
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/room-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl,
          furnitureData: initialFurnitureData 
        }),
      });

      // Check if response is JSON
      const contentType = response?.headers?.get('content-type');
      if (!contentType || !contentType?.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check your OpenAI API configuration.');
      }

      const data = await response?.json();
      
      if (data?.success) {
        setAiAnalysis(data?.analysis);
        setShowAnalysisPanel(true);
        setShowAISuggestions(true);
        setAiSuggestionType('room');
      } else {
        console.error('AI analysis failed:', data?.error);
        const errorMessage = data?.error || 'AI analysis failed';
        alert(`${errorMessage}\n\nYou can still design your room manually.`);
      }
    } catch (error) {
      console.error('Error analyzing room:', error);
      const errorMessage = error?.message || 'Failed to analyze room';
      alert(`${errorMessage}\n\nYou can still design your room manually.`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAddFurniture = (furniture, position = null) => {
    const newFurniture = {
      ...furniture,
      id: `${furniture?.id}-${Date.now()}`,
      position: position || { x: 30, y: 30 },
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

  const handleGetLayoutSuggestions = async () => {
    if (!aiAnalysis) {
      // If no analysis yet, perform analysis first
      if (!uploadedImage) {
        alert('Please upload a room image first');
        return;
      }
      
      setIsProcessingAI(true);
      try {
        const response = await fetch('/api/room-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl: uploadedImage,
            furnitureData: initialFurnitureData 
          }),
        });

        // Check if response is JSON
        const contentType = response?.headers?.get('content-type');
        if (!contentType || !contentType?.includes('application/json')) {
          throw new Error('Server returned non-JSON response. Please check your OpenAI API configuration.');
        }

        const data = await response?.json();
        
        if (data?.success) {
          setAiAnalysis(data?.analysis);
          setShowAnalysisPanel(true);
          setShowAISuggestions(true);
          setAiSuggestionType('layout');
        } else {
          const errorMessage = data?.error || 'Failed to get AI suggestions';
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Error getting layout suggestions:', error);
        const errorMessage = error?.message || 'Failed to get AI suggestions';
        alert(errorMessage);
      } finally {
        setIsProcessingAI(false);
      }
    } else {
      setShowAISuggestions(true);
      setAiSuggestionType('layout');
      setShowAnalysisPanel(true);
    }
  };

  const handleGetColorMatching = () => {
    if (aiAnalysis) {
      setShowAISuggestions(true);
      setAiSuggestionType('color');
      setShowAnalysisPanel(true);
    } else {
      alert('Please analyze the room first by uploading an image');
    }
  };

  const handleApplyRecommendation = (furnitureId) => {
    const furniture = initialFurnitureData?.find(item => item?.id === furnitureId);
    if (furniture) {
      handleAddFurniture(furniture);
    }
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
                  Upload your room photo and get AI-powered furniture recommendations
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
              {isProcessingAI && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span className="font-body text-primary font-medium">
                      AI is analyzing your room...
                    </span>
                  </div>
                </div>
              )}

              {aiAnalysis && showAnalysisPanel && (
                <div className="bg-surface border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      AI Room Analysis
                    </h3>
                    <button
                      onClick={() => setShowAnalysisPanel(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="XMarkIcon" size={20} variant="solid" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-body font-semibold text-foreground mb-2">
                        Room Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 text-foreground">{aiAnalysis?.roomAnalysis?.roomType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Style:</span>
                          <span className="ml-2 text-foreground">{aiAnalysis?.roomAnalysis?.style}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="ml-2 text-foreground">{aiAnalysis?.roomAnalysis?.estimatedDimensions}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-body font-semibold text-foreground mb-2">
                        Color Palette
                      </h4>
                      <div className="flex gap-2">
                        {aiAnalysis?.roomAnalysis?.dominantColors?.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-background rounded-md text-sm"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            ></div>
                            <span className="text-foreground">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-body font-semibold text-foreground mb-3">
                        Recommended Furniture
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {aiAnalysis?.furnitureRecommendations
                          ?.sort((a, b) => {
                            const priorityOrder = { high: 0, medium: 1, low: 2 };
                            return priorityOrder?.[a?.priority] - priorityOrder?.[b?.priority];
                          })
                          ?.map((rec, index) => {
                            const furniture = initialFurnitureData?.find(
                              item => item?.id === rec?.furnitureId
                            );
                            return (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-background rounded-md border border-border"
                              >
                                <img
                                  src={furniture?.image}
                                  alt={furniture?.alt}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-body font-medium text-foreground">
                                      {furniture?.name}
                                    </h5>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded ${
                                        rec?.priority === 'high' ?'bg-red-100 text-red-700'
                                          : rec?.priority === 'medium' ?'bg-yellow-100 text-yellow-700' :'bg-green-100 text-green-700'
                                      }`}
                                    >
                                      {rec?.priority}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {rec?.reason}
                                  </p>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    💡 {rec?.colorMatch}
                                  </p>
                                  <button
                                    onClick={() => handleApplyRecommendation(rec?.furnitureId)}
                                    className="text-sm text-primary hover:text-primary/80 font-medium"
                                  >
                                    Add to Canvas
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {aiAnalysis?.layoutSuggestions?.length > 0 && (
                      <div>
                        <h4 className="font-body font-semibold text-foreground mb-2">
                          Layout Tips
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis?.layoutSuggestions?.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{tip?.area}:</span>{' '}
                              {tip?.suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-body font-semibold text-sm text-foreground mb-1">
                      How to Use Drag & Drop
                    </p>
                    <ul className="font-body text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <span><strong>Drag from palette:</strong> Click and hold furniture, drag onto room image, release to place</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <span><strong>Move on canvas:</strong> Click and drag placed furniture to reposition</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <span><strong>Rotate:</strong> Ctrl/Cmd + Drag or use scroll wheel on furniture</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        <span><strong>Scale:</strong> Ctrl/Cmd + Scroll or use scale buttons</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

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
                  onAddFurniture={handleAddFurniture}
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
                Start Your AI-Powered Room Design
              </h2>
              <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">
                Upload a photo of your room to get AI-powered furniture recommendations based on colors, style, and spatial layout.
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