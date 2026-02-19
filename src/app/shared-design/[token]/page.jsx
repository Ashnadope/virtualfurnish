'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import PublicHeader from '@/components/common/PublicHeader';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { roomDesignService } from '@/services/roomDesign.service';
import { useAuth } from '@/contexts/AuthContext';

export default function SharedDesignPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { user, userRole } = useAuth();
  
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  useEffect(() => {
    if (token) {
      loadSharedDesign();
    }
  }, [token]);

  const loadSharedDesign = async () => {
    try {
      setLoading(true);
      const { data, error } = await roomDesignService.getDesignByShareToken(token);
      
      if (error) {
        setError('Design not found or is not publicly shared');
        return;
      }

      // Use render_url if available, otherwise fall back to room_image_url
      const imagePath = data.render_url || data.room_image_url;
      
      // Only get signed URL if we have an image path
      let signedUrl = null;
      if (imagePath) {
        const result = await roomDesignService.getSignedUrl(imagePath);
        signedUrl = result.signedUrl;
      }

      setDesign(data);
      setPreviewImageUrl(signedUrl);
    } catch (error) {
      console.error('Error loading shared design:', error);
      setError('Failed to load design');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {user ? (
          <>
            <Sidebar userRole={userRole || 'customer'} />
            <Header userRole={userRole || 'customer'} />
          </>
        ) : (
          <PublicHeader />
        )}
        <main className={user ? "lg:ml-sidebar pt-16" : "pt-16"}>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-body text-lg text-foreground">Loading shared design...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-background">
        {user ? (
          <>
            <Sidebar userRole={userRole || 'customer'} />
            <Header userRole={userRole || 'customer'} />
          </>
        ) : (
          <PublicHeader />
        )}
        <main className={user ? "lg:ml-sidebar pt-16" : "pt-16"}>
          <div className="p-6 max-w-5xl mx-auto">
            <div className="bg-surface rounded-lg shadow-card p-12 text-center">
              <Icon name="ExclamationCircleIcon" size={64} variant="outline" className="mx-auto text-error mb-4" />
              <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
                Design Not Found
              </h1>
              <p className="font-body text-muted-foreground mb-6">
                {error || 'This design does not exist or is no longer publicly shared.'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast font-body font-medium"
              >
                Go to Home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const furnitureCount = design.design_data?.furniture?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <>
          <Sidebar userRole={userRole || 'customer'} />
          <Header userRole={userRole || 'customer'} />
        </>
      ) : (
        <PublicHeader />
      )}
      <main className={user ? "lg:ml-sidebar pt-16" : "pt-16"}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground mb-2 flex items-center gap-3">
                {design.name || 'Untitled Design'}
                <span className="px-3 py-1 bg-success text-white text-sm rounded-md font-body font-medium">
                  Shared Design
                </span>
              </h1>
              {design.description && (
                <p className="font-body text-muted-foreground">
                  {design.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-body text-xs text-muted-foreground">
                  {design.view_count} {design.view_count === 1 ? 'view' : 'views'}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {furnitureCount} furniture {furnitureCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action Banner for Non-Authenticated Users */}
          {!user && (
            <div className="mb-6 bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-lg p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="SparklesIcon" size={24} variant="solid" className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-1">
                      Create Your Own Room Designs
                    </h3>
                    <p className="font-body text-sm text-white/90">
                      Design with AI-powered suggestions, save your work, and shop directly from your designs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-6 py-3 bg-white text-primary rounded-lg font-body font-medium hover:bg-white/90 transition-colors whitespace-nowrap"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Room Design Preview */}
            <div className="lg:col-span-2">
              <div className="bg-surface rounded-lg shadow-card overflow-hidden border border-border">
                <div className="aspect-video bg-background">
                  {previewImageUrl ? (
                    <AppImage
                      src={previewImageUrl}
                      alt={design.name || 'Room design'}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="PhotoIcon" size={96} variant="outline" className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* AI Analysis */}
              {design.design_data?.aiAnalysis && (
                <div className="bg-surface rounded-lg shadow-card p-6 mt-6 border border-border">
                  <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Icon name="SparklesIcon" size={20} variant="solid" className="text-primary" />
                    AI Room Analysis
                  </h2>
                  <div className="space-y-4">
                    {design.design_data.aiAnalysis.roomType && (
                      <div>
                        <h3 className="font-body font-medium text-sm text-muted-foreground mb-1">Room Type</h3>
                        <p className="font-body text-foreground">{design.design_data.aiAnalysis.roomType}</p>
                      </div>
                    )}
                    {design.design_data.aiAnalysis.style && (
                      <div>
                        <h3 className="font-body font-medium text-sm text-muted-foreground mb-1">Style</h3>
                        <p className="font-body text-foreground">{design.design_data.aiAnalysis.style}</p>
                      </div>
                    )}
                    {design.design_data.aiAnalysis.colors && (
                      <div>
                        <h3 className="font-body font-medium text-sm text-muted-foreground mb-1">Color Palette</h3>
                        <p className="font-body text-foreground">{design.design_data.aiAnalysis.colors}</p>
                      </div>
                    )}
                    {design.design_data.aiAnalysis.suggestions && (
                      <div>
                        <h3 className="font-body font-medium text-sm text-muted-foreground mb-1">Suggestions</h3>
                        <p className="font-body text-foreground">{design.design_data.aiAnalysis.suggestions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Furniture List */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-lg shadow-card p-6 border border-border">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Furniture Items ({furnitureCount})
                </h2>

                {furnitureCount === 0 ? (
                  <p className="font-body text-muted-foreground text-center py-8">
                    No furniture items in this design
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {design.design_data.furniture.map((item, index) => (
                      <div key={item.id || index} className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border hover:border-primary/50 transition-fast">
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <AppImage
                              src={item.image}
                              alt={item.name || 'Furniture item'}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
                              <Icon name="CubeIcon" size={24} variant="outline" className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-sm text-foreground mb-1">
                            {item.name || 'Unnamed Item'}
                          </p>
                          {item.category && (
                            <p className="font-body text-xs text-muted-foreground mb-2">
                              {item.category}
                            </p>
                          )}
                          {item.price && (
                            <p className="font-body font-semibold text-primary mb-2">
                              ₱{item.price.toLocaleString()}
                            </p>
                          )}
                          {item.dimensions && (
                            <p className="font-body text-xs text-muted-foreground">
                              {item.dimensions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {furnitureCount > 0 && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm font-medium text-foreground">Total Items:</span>
                      <span className="font-body text-sm font-semibold text-foreground">{furnitureCount}</span>
                    </div>
                    {design.design_data.furniture.some(item => item.price) && (
                      <div className="flex items-center justify-between">
                        <span className="font-body text-sm font-medium text-foreground">Estimated Total:</span>
                        <span className="font-heading text-lg font-bold text-primary">
                          ₱{design.design_data.furniture
                            .filter(item => item.price)
                            .reduce((sum, item) => sum + item.price, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => router.push(user ? '/virtual-room-designer' : '/login')}
                    className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast font-body font-medium flex items-center justify-center gap-2"
                  >
                    <Icon name={user ? "PencilIcon" : "ArrowRightCircleIcon"} size={16} variant="outline" />
                    {user ? 'Create My Own Design' : 'Sign In to Create Your Own'}
                  </button>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mt-4 border border-border">
                <p className="font-body text-xs text-muted-foreground text-center">
                  Created {new Date(design.created_at).toLocaleDateString()}
                  {design.updated_at !== design.created_at && (
                    <> · Updated {new Date(design.updated_at).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
