'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
import ContinueDesignModal from './ContinueDesignModal';
import SaveDesignModal from './SaveDesignModal';
import Icon from '@/components/ui/AppIcon';
import { roomDesignService } from '@/services/roomDesign.service';
import { cartService } from '@/services/cart.service';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function VirtualRoomDesignerInteractive({ initialFurnitureData }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const designId = searchParams.get('design');
  const canvasRef = useRef(null);
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [roomImagePath, setRoomImagePath] = useState(null);
  const [placedFurniture, setPlacedFurniture] = useState([]);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestionType, setAiSuggestionType] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null); // { type: 'success'|'error', message }
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoadingDesign, setIsLoadingDesign] = useState(false);
  const [isGeneratingRender, setIsGeneratingRender] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [latestDesign, setLatestDesign] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');

  // Load design from URL parameter or check for latest design
  useEffect(() => {
    const initializeDesign = async () => {
      if (designId) {
        // If design ID in URL, load that specific design
        loadDesignFromDatabase(designId);
      } else if (user?.id) {
        // Otherwise, check if user has any previous designs
        try {
          const { data, error } = await roomDesignService.getUserDesigns(user.id);
          
          if (!error && data && data.length > 0) {
            // Get the latest design
            const latest = data[0];
            
            // Get thumbnail (prefer render_url)
            const imagePath = latest.render_url || latest.room_image_url;
            let thumbnailUrl = null;
            if (imagePath) {
              const result = await roomDesignService.getSignedUrl(imagePath);
              thumbnailUrl = result.signedUrl;
            }
            
            // Set latest design and show modal
            setLatestDesign({
              id: latest.id,
              name: latest.name,
              thumbnail: thumbnailUrl,
              updated_at: latest.updated_at,
              furnitureCount: latest.design_data?.furniture?.length || 0,
              fullData: latest
            });
            setShowContinueModal(true);
          }
        } catch (error) {
          console.error('Error checking for latest design:', error);
        }
      }
    };

    initializeDesign();
  }, [designId, user?.id]);

  const loadDesignFromDatabase = async (id) => {
    try {
      setIsLoadingDesign(true);
      console.log('Loading design from database:', id);

      const { data, error } = await roomDesignService.getDesignById(id);
      
      if (error) {
        console.error('Error loading design:', error);
        alert('Failed to load design');
        return;
      }

      console.log('Design loaded:', data);

      // Get signed URL for the room image
      const { signedUrl } = await roomDesignService.getSignedUrl(data.room_image_url);

      // Set design data
      setCurrentDesignId(data.id);
      setRoomImagePath(data.room_image_url);
      setUploadedImage(signedUrl);
      
      const loadedFurniture = data.design_data?.furniture || [];
      setPlacedFurniture(loadedFurniture);
      setAiAnalysis(data.design_data?.aiAnalysis || null);
      setLastSaved(new Date(data.updated_at));
      setDesignName(data.name || '');
      setDesignDescription(data.description || '');

      // Initialize history with the loaded state
      setHistory([{ image: signedUrl, furniture: loadedFurniture }]);
      setHistoryIndex(0);

      // Show the analysis panel if AI analysis exists
      if (data.design_data?.aiAnalysis) {
        setShowAnalysisPanel(true);
      }

      console.log('Design loaded successfully, furniture count:', loadedFurniture.length);
      console.log('Placed furniture:', loadedFurniture);
    } catch (error) {
      console.error('Error in loadDesignFromDatabase:', error);
      alert('Failed to load design');
    } finally {
      setIsLoadingDesign(false);
    }
  };

  // Handle continuing latest design
  const handleContinueDesign = async () => {
    setShowContinueModal(false);
    if (latestDesign?.fullData) {
      await loadDesignFromDatabase(latestDesign.id);
    }
  };

  // Handle starting new design
  const handleStartNewDesign = () => {
    setShowContinueModal(false);
    setLatestDesign(null);
    setShowUploadModal(true);
  };

  // Auto-save design when furniture changes
  useEffect(() => {
    if (currentDesignId && placedFurniture.length >= 0) {
      const autoSaveTimer = setTimeout(() => {
        saveDesignToDatabase();
        // Also generate render after saving
        if (placedFurniture.length > 0) {
          generateAndUploadRender();
        }
      }, 2000); // Auto-save after 2 seconds of no changes

      return () => clearTimeout(autoSaveTimer);
    }
  }, [placedFurniture, currentDesignId]);

  const generateAndUploadRender = async () => {
    if (!canvasRef.current || !currentDesignId || !user) {
      console.log('Cannot generate render: missing requirements');
      return;
    }

    try {
      setIsGeneratingRender(true);
      console.log('Generating design render...');

      // Capture the canvas
      const blob = await canvasRef.current.captureCanvas();
      console.log('Canvas captured as blob:', blob.size, 'bytes');

      const supabase = createClient();
      
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `render-${timestamp}.png`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading render to design-renders bucket...', filePath);

      // Upload to design-renders bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-renders')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true, // Allow overwriting
          contentType: 'image/png'
        });

      if (uploadError) {
        console.error('Error uploading render:', uploadError);
        return;
      }

      console.log('Render uploaded successfully:', uploadData);

      // Update room_designs with render URL
      const { error: updateError } = await roomDesignService.updateDesign(currentDesignId, {
        render_url: filePath
      });

      if (updateError) {
        console.error('Error updating design with render URL:', updateError);
      } else {
        console.log('Design updated with render URL');
      }
    } catch (error) {
      console.error('Error generating render:', error);
    } finally {
      setIsGeneratingRender(false);
    }
  };

  const saveDesignToDatabase = async () => {
    if (!currentDesignId) {
      console.log('No design ID, skipping save');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Saving design to database...', {
        designId: currentDesignId,
        furnitureCount: placedFurniture.length
      });

      const { error } = await roomDesignService.updateDesign(currentDesignId, {
        design_data: {
          furniture: placedFurniture,
          aiAnalysis: aiAnalysis
        }
      });

      if (error) {
        console.error('Error saving design:', error);
        return;
      }

      setLastSaved(new Date());
      console.log('Design saved successfully');
    } catch (error) {
      console.error('Error in saveDesignToDatabase:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToHistory = (newState) => {
    const newHistory = history?.slice(0, historyIndex + 1);
    newHistory?.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory?.length - 1);
  };

  const handleImageUpload = async (uploadData) => {
    console.log('=== Room upload data received ===', uploadData);
    
    setUploadedImage(uploadData.imageUrl);
    setRoomImagePath(uploadData.imagePath);
    setCurrentDesignId(uploadData.designId);
    setPlacedFurniture([]);
    setDesignName(`Room Design ${new Date().toLocaleDateString()}`);
    setDesignDescription('');
    saveToHistory({ image: uploadData.imageUrl, furniture: [] });
    
    // Automatically trigger AI analysis after image upload
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/room-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: uploadData.imageUrl,
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
      _catalogId: furniture?.id,  // always store original variant ID for lookup
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
    if (!currentDesignId) {
      alert('Please upload a room image first to create a design.');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveWithDetails = async ({ name, description }) => {
    try {
      // Save both design metadata (name/description) AND design data (furniture/aiAnalysis)
      const { error } = await roomDesignService.updateDesign(currentDesignId, {
        name,
        description,
        design_data: {
          furniture: placedFurniture,
          aiAnalysis: aiAnalysis
        }
      });

      if (error) {
        throw error;
      }

      setDesignName(name);
      setDesignDescription(description);
      setLastSaved(new Date());
      
      // Show success message (could be replaced with a toast notification)
      alert('Design saved successfully!');
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design. Please try again.');
      throw error;
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

  /**
   * Resolve a canvas position (0–100%) for a recommendation.
   * Priority order:
   *  1. suggestedPosition from new AI response (numeric x/y already in %)
   *  2. Parse placementSuggestion text for spatial keywords → approximate coords
   *  3. Distribute evenly across canvas as last resort
   */
  const resolvePosition = (rec, index) => {
    // 1. New API format: explicit numeric position
    if (rec?.suggestedPosition?.x != null && rec?.suggestedPosition?.y != null) {
      return {
        x: Math.max(5, Math.min(90, Number(rec.suggestedPosition.x) || 30)),
        y: Math.max(5, Math.min(90, Number(rec.suggestedPosition.y) || 30)),
      };
    }

    // 2. Parse placement text for spatial keywords
    const text = (rec?.placementSuggestion || '').toLowerCase();

    // Horizontal: left / center / right
    let x = 45; // default center
    if (/\bleft\b|left wall|left corner/.test(text))        x = 12;
    else if (/\bright\b|right wall|right corner/.test(text)) x = 78;
    else if (/\bcenter\b|central|middle|between/.test(text)) x = 45;
    else if (/window/.test(text))                             x = 38;
    else if (/far wall|back wall/.test(text))                 x = 45;
    else if (/corner/.test(text))                             x = 10;

    // Vertical: top (far wall) / middle / bottom (near/front)
    let y = 35; // default upper-mid (furniture tends to sit towards back of room)
    if (/\btop\b|far wall|back wall|above|behind/.test(text))  y = 18;
    else if (/\bbottom\b|front|near|foreground/.test(text))    y = 70;
    else if (/\bmiddle\b|center|central|between/.test(text))   y = 45;
    else if (/corner/.test(text))                              y = 15;
    else if (/window/.test(text))                              y = 22;
    else if (/replacing|replace/.test(text))                   y = 30;

    // Nudge items slightly so they don't stack exactly on top of each other
    const nudgeX = (index % 2 === 0 ? 1 : -1) * (index * 3);
    const nudgeY = Math.floor(index / 2) * 4;

    return {
      x: Math.max(5, Math.min(90, x + nudgeX)),
      y: Math.max(5, Math.min(90, y + nudgeY)),
    };
  };

  const handleApplyRecommendation = (rec) => {
    // furnitureId may be a variant ID (new format) or a product ID (old saved designs)
    const furniture = initialFurnitureData?.find(
      item => item?.id === rec?.furnitureId || item?.productId === rec?.furnitureId
    );
    if (furniture) {
      // handleAddFurniture already stores _catalogId and opens properties panel
      handleAddFurniture(furniture, resolvePosition(rec, 0));
    }
  };

  const handleApplyAllRecommendations = () => {
    const recs = aiAnalysis?.furnitureRecommendations || [];
    if (recs.length === 0) return;
    let updatedFurniture = [...placedFurniture];
    let lastAddedId = null;
    recs.forEach((rec, i) => {
      const furniture = initialFurnitureData?.find(
        item => item?.id === rec?.furnitureId || item?.productId === rec?.furnitureId
      );
      if (!furniture) return;
      const placedItem = {
        ...furniture,
        _catalogId: furniture.id,  // store original variant ID for lookup
        id: `${furniture.id}-${Date.now() + i}`,
        position: resolvePosition(rec, i),
        rotation: 0,
        scale: 1,
      };
      updatedFurniture = [...updatedFurniture, placedItem];
      lastAddedId = placedItem.id;
    });
    setPlacedFurniture(updatedFurniture);
    saveToHistory({ image: uploadedImage, furniture: updatedFurniture });
    // Select the last placed item so properties panel opens
    if (lastAddedId) {
      setSelectedFurnitureId(lastAddedId);
      setShowPropertiesPanel(true);
    }
  };

  const handleAddToCart = async (furniture) => {
    const showFeedback = (type, message) => {
      setCartFeedback({ type, message });
      setTimeout(() => setCartFeedback(null), 3000);
    };

    if (!user) {
      showFeedback('error', 'Please log in to add items to cart.');
      return;
    }

    const productId = furniture?.productId;
    const variantId = furniture?.variantId || furniture?._catalogId || furniture?.id;
    const price = furniture?.price;

    if (!productId || !variantId) {
      showFeedback('error', 'Could not identify product. Please try again.');
      return;
    }

    const { error } = await cartService.addToCart({ productId, variantId, quantity: 1, price });
    if (error) {
      showFeedback('error', `Failed to add to cart: ${error}`);
    } else {
      showFeedback('success', `${furniture?.name ?? 'Item'} added to cart!`);
    }
  };

  const selectedFurniture = placedFurniture?.find(f => f?.id === selectedFurnitureId);
  // Use _catalogId stored on placement (reliable), fall back to stripping timestamp suffix for old designs
  const selectedFurnitureLookupId = selectedFurniture?._catalogId
    || selectedFurniture?.id?.replace(/-\d+(-\d+)?$/, '');
  const selectedFurnitureDetails = selectedFurniture
    ? initialFurnitureData?.find(
        item => item?.id === selectedFurnitureLookupId || item?.productId === selectedFurnitureLookupId
      ) ?? selectedFurniture  // last resort: use the placed item itself (has name/image/price)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Cart feedback toast */}
      {cartFeedback && (
        <div className={`fixed top-20 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${cartFeedback.type === 'success' ? 'bg-success text-white' : 'bg-destructive text-white'}`}>
          <Icon name={cartFeedback.type === 'success' ? 'CheckCircleIcon' : 'XCircleIcon'} size={20} variant="solid" />
          <span className="font-body text-sm font-medium">{cartFeedback.message}</span>
        </div>
      )}
      <Sidebar userRole="customer" />
      <Header userRole="customer" userName="John Doe" />
      <main className="pt-16">
        <div className="p-6">
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {isLoadingDesign ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-body text-lg text-foreground">Loading your design...</p>
              <p className="font-body text-sm text-muted-foreground mt-2">Please wait while we retrieve your room design</p>
            </div>
          ) : (
            <>
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

                  <div className="flex items-center gap-4">
                    {currentDesignId && (
                      <div className="flex items-center gap-2 text-sm">
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="font-body text-muted-foreground">Saving...</span>
                          </>
                        ) : lastSaved ? (
                          <>
                            <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-success" />
                            <span className="font-body text-muted-foreground">
                              Saved {new Date(lastSaved).toLocaleTimeString()}
                            </span>
                          </>
                        ) : null}
                      </div>
                    )}
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
                        Dominant Colors in Room
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis?.roomAnalysis?.dominantColors?.map((color, index) => {
                          // Extract hex code from "ColorName (#HEXCODE)" format
                          const hexMatch = color?.match(/#[0-9A-Fa-f]{6}/);
                          const hexCode = hexMatch ? hexMatch[0] : '#cccccc'; // Fallback to gray if no hex found
                          const colorName = color?.replace(/\s*\(.*?\)\s*/, '') || 'Unknown';
                          
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1 bg-background rounded-md text-sm border border-border"
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                                style={{ backgroundColor: hexCode }}
                                title={hexCode}
                              ></div>
                              <span className="text-foreground text-xs">{colorName}</span>
                            </div>
                          );
                        })}
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
                            // furnitureId may be a variant ID (new) or product ID (old saved designs)
                            const furniture = initialFurnitureData?.find(
                              item => item?.id === rec?.furnitureId || item?.productId === rec?.furnitureId
                            );
                            return (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-background rounded-md border border-border"
                              >
                                {furniture?.image ? (
                                  <img
                                    src={furniture.image}
                                    alt={furniture?.alt || furniture?.name}
                                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded flex-shrink-0 bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                    No img
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-body font-medium text-foreground">
                                      {furniture?.name || `Product ID: ${rec?.furnitureId?.slice(0, 8)}…`}
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
                                    onClick={() => handleApplyRecommendation(rec)}
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
                        <ul className="space-y-2 mb-3">
                          {aiAnalysis?.layoutSuggestions?.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{tip?.area}:</span>{' '}
                              {tip?.suggestion}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={handleApplyAllRecommendations}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-fast text-sm font-medium"
                        >
                          <Icon name="SparklesIcon" size={16} variant="solid" />
                          Apply All Recommendations to Canvas
                        </button>
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

              <div className="flex gap-4 h-[calc(100vh-8rem)]">
                <CanvasArea
                  ref={canvasRef}
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
                  colorPalette={aiAnalysis?.colorPaletteSuggestions || null}
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
          </>
          )}
        </div>
      </main>
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleImageUpload}
      />
      <ContinueDesignModal
        isOpen={showContinueModal}
        onContinue={handleContinueDesign}
        onStartNew={handleStartNewDesign}
        design={latestDesign}
      />
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveWithDetails}
        currentName={designName}
        currentDescription={designDescription}
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