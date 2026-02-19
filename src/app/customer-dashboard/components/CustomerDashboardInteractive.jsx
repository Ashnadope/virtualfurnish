'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeSection from './WelcomeSection';
import ActionTile from './ActionTile';
import RecentDesignCard from './RecentDesignCard';
import RecommendationCard from './RecommendationCard';
import OrderStatusCard from './OrderStatusCard';
import ShareDesignModal from './ShareDesignModal';
import { roomDesignService } from '@/services/roomDesign.service';
import PropTypes from 'prop-types';

export default function CustomerDashboardInteractive({ initialData }) {
  const router = useRouter();
  const [designs, setDesigns] = useState(initialData?.recentDesigns || []);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState({ url: '', name: '' });

  const handleContinueDesign = (designId) => {
    router?.push(`/virtual-room-designer?design=${designId}`);
  };

  const handleShareDesign = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      if (!design) return;

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

  const handleAddToCart = (productId) => {
    console.log(`Added product ${productId} to cart`);
  };

  const handleViewProductDetails = (productId) => {
    console.log(`Viewing product ${productId} details`);
  };

  // Update designs when initialData changes
  useEffect(() => {
    if (initialData?.recentDesigns) {
      setDesigns(initialData.recentDesigns);
    }
  }, [initialData]);

  return (
    <div className="space-y-6">
      <WelcomeSection
        userName={initialData?.userName}
        savedDesigns={initialData?.savedDesigns}
        wishlistItems={initialData?.wishlistItems}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {initialData?.actionTiles?.map((tile) => (
          <ActionTile
            key={tile?.id}
            tile={tile}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-foreground">Recent Designs</h2>
          <button
            onClick={() => router?.push('/my-designs')}
            className="font-body text-sm text-primary hover:text-primary/80 transition-fast flex items-center gap-1"
          >
            View All
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {designs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs?.map((design) => (
              <RecentDesignCard
                key={design?.id}
                design={design}
                onContinue={handleContinueDesign}
                onShare={handleShareDesign}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-lg border border-border p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No designs yet</h3>
            <p className="font-body text-muted-foreground mb-4">Start creating your first room design with AI assistance</p>
            <button
              onClick={() => router?.push('/virtual-room-designer')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast font-body font-medium"
            >
              Create First Design
            </button>
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">Recommended for You</h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Based on your browsing and design history
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {initialData?.recommendations?.map((product) => (
            <RecommendationCard
              key={product?.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProductDetails}
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground mb-4">Recent Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialData?.recentOrders?.map((order) => (
            <OrderStatusCard key={order?.orderNumber} order={order} />
          ))}
        </div>
      </div>

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

CustomerDashboardInteractive.propTypes = {
  initialData: PropTypes?.shape({
    userName: PropTypes?.string?.isRequired,
    savedDesigns: PropTypes?.number?.isRequired,
    wishlistItems: PropTypes?.number?.isRequired,
    actionTiles: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        icon: PropTypes?.string?.isRequired,
        href: PropTypes?.string?.isRequired,
        bgColor: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
    recentDesigns: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        thumbnail: PropTypes?.string?.isRequired,
        alt: PropTypes?.string?.isRequired,
        date: PropTypes?.string?.isRequired,
        itemCount: PropTypes?.number?.isRequired,
        roomType: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
    recommendations: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        price: PropTypes?.number?.isRequired,
        discountedPrice: PropTypes?.number,
        discount: PropTypes?.number,
        image: PropTypes?.string?.isRequired,
        alt: PropTypes?.string?.isRequired,
        rating: PropTypes?.number?.isRequired,
        reviews: PropTypes?.number?.isRequired,
      })
    )?.isRequired,
    recentOrders: PropTypes?.arrayOf(
      PropTypes?.shape({
        orderNumber: PropTypes?.string?.isRequired,
        productName: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired,
        orderDate: PropTypes?.string?.isRequired,
        estimatedDelivery: PropTypes?.string,
        totalAmount: PropTypes?.number?.isRequired,
      })
    )?.isRequired,
  })?.isRequired,
};