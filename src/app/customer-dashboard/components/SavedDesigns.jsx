'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { roomDesignService } from '@/services/roomDesign.service';
import { useAuth } from '@/contexts/AuthContext';
import ShareDesignModal from './ShareDesignModal';

export default function SavedDesigns({ limit = null, showAll = false }) {
  const { user } = useAuth();
  const router = useRouter();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState({ url: '', name: '' });

  useEffect(() => {
    const loadDesigns = async () => {
      try {
        setLoading(true);
        const { data, error } = await roomDesignService.getUserDesigns(user.id);
        
        if (error) {
          setError(error);
          setDesigns([]);
          return;
        }

        // Get signed URLs for all designs (or limited number)
        let designsToShow = data || [];
        if (limit && !showAll) {
          designsToShow = data.slice(0, limit);
        }

        const designsWithUrls = await Promise.all(
          designsToShow.map(async (design) => {
            // Use render_url if available, otherwise fall back to room_image_url
            const imagePath = design.render_url || design.room_image_url;
            
            // Only get signed URL if we have an image path
            let signedUrl = null;
            if (imagePath) {
              const result = await roomDesignService.getSignedUrl(imagePath);
              signedUrl = result.signedUrl;
            }
            
            return {
              ...design,
              imageUrl: signedUrl
            };
          })
        );

        setDesigns(designsWithUrls);
      } catch (error) {
        console.error('Error loading designs:', error);
        setError('Failed to load designs');
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadDesigns();
    } else {
      setLoading(false);
    }
  }, [user?.id, limit, showAll]);

  const handleContinueDesign = (designId) => {
    router.push(`/virtual-room-designer?design=${designId}`);
  };

  const handleShareDesign = async (design) => {
    try {
      let shareToken = design.share_token;

      // If not public yet, make it public and get the share token
      if (!design.is_public) {
        const { data, error } = await roomDesignService.togglePublicStatus(design.id, true);
        
        if (error) {
          alert('Failed to enable sharing: ' + error);
          return;
        }
        
        shareToken = data.share_token;
        
        // Update the design in the local state
        setDesigns(designs.map(d => 
          d.id === design.id ? { ...d, is_public: true, share_token: shareToken } : d
        ));
      }

      if (!shareToken) {
        alert('Failed to generate share link. Please try again.');
        return;
      }

      const shareUrl = `${window.location.origin}/shared-design/${shareToken}`;
      
      // Open share modal
      setShareModalData({ url: shareUrl, name: design.name });
      setShareModalOpen(true);
    } catch (error) {
      console.error('Error sharing design:', error);
      alert('Failed to generate share link');
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      await roomDesignService.deleteDesign(designId);
      setDesigns(designs.filter(d => d.id !== designId));
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
          My Room Designs
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
          My Room Designs
        </h2>
        <div className="text-center py-12">
          <Icon name="ExclamationCircleIcon" size={48} variant="outline" className="mx-auto text-error mb-4" />
          <p className="font-body text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          My Room Designs
        </h2>
        <button
          onClick={() => router.push('/virtual-room-designer')}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast text-sm font-medium"
        >
          <Icon name="PlusIcon" size={16} variant="solid" />
          New Design
        </button>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="PhotoIcon" size={48} variant="outline" className="mx-auto text-muted-foreground mb-4" />
          <p className="font-body text-muted-foreground mb-4">
            No room designs yet. Start by uploading a room photo!
          </p>
          <button
            onClick={() => router.push('/virtual-room-designer')}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast font-body font-medium"
          >
            Create Your First Design
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <div key={design.id} className="bg-muted rounded-lg overflow-hidden border border-border group">
              <div className="aspect-video bg-background relative">
                {design.imageUrl ? (
                  <AppImage
                    src={design.imageUrl}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="PhotoIcon" size={48} variant="outline" className="text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-heading font-semibold text-foreground mb-1 truncate">
                  {design.name || 'Untitled Design'}
                </h3>
                <p className="font-body text-xs text-muted-foreground mb-3">
                  Updated {new Date(design.updated_at).toLocaleDateString()}
                </p>

                {design.design_data?.furniture && (
                  <p className="font-body text-xs text-muted-foreground mb-3">
                    {design.design_data.furniture.length} furniture items
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleContinueDesign(design.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast text-sm font-medium"
                  >
                    <Icon name="PencilIcon" size={14} variant="outline" />
                    Continue
                  </button>
                  <button
                    onClick={() => handleShareDesign(design)}
                    className="px-3 py-2 rounded-md border border-border hover:bg-surface transition-fast"
                    title="Share design"
                  >
                    <Icon name="ShareIcon" size={16} variant="outline" className="text-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteDesign(design.id)}
                    className="px-3 py-2 rounded-md border border-border hover:bg-error/10 hover:border-error transition-fast"
                    title="Delete design"
                  >
                    <Icon name="TrashIcon" size={16} variant="outline" className="text-error" />
                  </button>
                </div>

                {design.is_public && design.view_count > 0 && (
                  <p className="font-body text-xs text-muted-foreground mt-2">
                    {design.view_count} {design.view_count === 1 ? 'view' : 'views'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Design Modal */}
      <ShareDesignModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareModalData.url}
        designName={shareModalData.name}
      />
    </div>
  );
}

SavedDesigns.propTypes = {
  limit: PropTypes.number,
  showAll: PropTypes.bool
};
