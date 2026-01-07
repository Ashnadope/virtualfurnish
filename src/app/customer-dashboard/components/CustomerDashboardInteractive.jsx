'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeSection from './WelcomeSection';
import ActionTile from './ActionTile';
import RecentDesignCard from './RecentDesignCard';
import RecommendationCard from './RecommendationCard';
import OrderStatusCard from './OrderStatusCard';
import PropTypes from 'prop-types';

export default function CustomerDashboardInteractive({ initialData }) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState(null);

  const handleContinueDesign = (designId) => {
    router?.push(`/virtual-room-designer?design=${designId}`);
  };

  const handleShareDesign = (designId) => {
    setSelectedDesignId(designId);
    setShowShareModal(true);
  };

  const handleAddToCart = (productId) => {
    console.log(`Added product ${productId} to cart`);
  };

  const handleViewProductDetails = (productId) => {
    console.log(`Viewing product ${productId} details`);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedDesignId(null);
  };

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
            title={tile?.title}
            description={tile?.description}
            icon={tile?.icon}
            href={tile?.href}
            bgColor={tile?.bgColor}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-foreground">Recent Designs</h2>
          <button
            onClick={() => router?.push('/virtual-room-designer')}
            className="font-body text-sm text-primary hover:text-primary/80 transition-fast flex items-center gap-1"
          >
            View All
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialData?.recentDesigns?.map((design) => (
            <RecentDesignCard
              key={design?.id}
              design={design}
              onContinue={handleContinueDesign}
              onShare={handleShareDesign}
            />
          ))}
        </div>
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
      {showShareModal && (
        <>
          <div
            className="fixed inset-0 bg-foreground/50 z-dropdown"
            onClick={closeShareModal}
            aria-hidden="true"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-lg shadow-elevated z-overlay w-full max-w-md p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-foreground">Share Design</h3>
              <button
                onClick={closeShareModal}
                className="text-muted-foreground hover:text-foreground transition-fast"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="font-body text-muted-foreground mb-4">
              Share your design #{selectedDesignId} with friends and family
            </p>
            <div className="flex gap-3">
              <button className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast">
                Copy Link
              </button>
              <button className="flex-1 bg-muted text-foreground px-4 py-2 rounded-md font-body text-sm font-medium hover:bg-muted/80 transition-fast">
                Share via Email
              </button>
            </div>
          </div>
        </>
      )}
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