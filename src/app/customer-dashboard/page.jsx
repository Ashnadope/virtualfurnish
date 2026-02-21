'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CustomerDashboardInteractive from './components/CustomerDashboardInteractive';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/order.service';
import { roomDesignService } from '@/services/roomDesign.service';
import { wishlistService } from '@/services/wishlist.service';
import { createClient } from '@/lib/supabase/client';

export default function CustomerDashboard() {
  const { user, isHydrated } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [totalDesignsCount, setTotalDesignsCount] = useState(0);
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Use name from AuthContext directly — it already has first_name from user_profiles
  const userName = user?.name || user?.email?.split('@')?.[0] || 'Customer';

  // If auth finishes with no user, stop the loading spinner
  useEffect(() => {
    if (isHydrated && !user?.id) {
      setDataLoading(false);
    }
  }, [isHydrated, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadOrdersData = async () => {
      try {
        const orders = await orderService.getUserOrders(user.id);
        if (isMounted) setOrderCount(orders?.length || 0);
        const statusMap = { delivered: 'Delivered', shipped: 'In Transit', processing: 'Processing', pending: 'Processing', packing: 'Processing' };
        const recent = (orders || []).slice(0, 3).map(order => ({
          orderNumber: order.orderNumber,
          productName: order.items?.[0]?.name || 'Order',
          status: statusMap[order.status] || 'Processing',
          orderDate: new Date(order.createdAt).toLocaleDateString('en-PH'),
          totalAmount: order.totalAmount
        }));
        if (isMounted) setRecentOrders(recent);
      } catch (error) {
        console.error('Error loading orders:', error);
        if (isMounted) setOrderCount(0);
      }
    };

    // Returns raw designs array for use in loadRecommendations
    const loadRecentDesigns = async () => {
      try {
        const { data, error } = await roomDesignService.getUserDesigns(user.id);
        if (error || !data || data.length === 0) {
          setRecentDesigns([]);
          return [];
        }
        setTotalDesignsCount(data.length);
        const latest3 = data.slice(0, 3);
        const designsWithUrls = await Promise.all(
          latest3.map(async (design) => {
            try {
              const imagePath = design.render_url || design.room_image_url;
              let signedUrl = null;
              if (imagePath) {
                const result = await roomDesignService.getSignedUrl(imagePath);
                signedUrl = result.signedUrl;
              }
              return {
                id: design.id,
                name: design.name,
                thumbnail: signedUrl,
                alt: design.description || design.name,
                date: new Date(design.updated_at).toLocaleDateString(),
                itemCount: design.design_data?.furniture?.length || 0,
                roomType: design.name,
                is_public: design.is_public,
                share_token: design.share_token
              };
            } catch {
              return {
                id: design.id, name: design.name, thumbnail: null,
                alt: design.description || design.name,
                date: new Date(design.updated_at).toLocaleDateString(),
                itemCount: design.design_data?.furniture?.length || 0,
                roomType: design.name, is_public: design.is_public, share_token: design.share_token
              };
            }
          })
        );
        setRecentDesigns(designsWithUrls);
        return data; // return all raw designs for recommendations
      } catch (error) {
        console.error('Error loading recent designs:', error);
        setRecentDesigns([]);
        return [];
      }
    };

    const loadRecommendations = async (allDesigns) => {
      try {
        const supabase = createClient();
        const seenVariantIds = new Set();
        const aiVariantIds = [];

        // Collect unique variant IDs from AI recommendations across all designs
        for (const design of allDesigns) {
          const recs = design.design_data?.aiAnalysis?.furnitureRecommendations || [];
          for (const rec of recs) {
            if (rec.furnitureId && !seenVariantIds.has(rec.furnitureId)) {
              seenVariantIds.add(rec.furnitureId);
              aiVariantIds.push(rec.furnitureId);
            }
          }
        }

        const results = [];
        const seenProductIds = new Set();

        // Fetch AI-recommended variants first
        if (aiVariantIds.length > 0) {
          const { data: variants } = await supabase
            .from('product_variants')
            .select('id, image_url, price, stock_quantity, products(id, name, category, image_url, base_price)')
            .in('id', aiVariantIds)
            .gt('stock_quantity', 0);

          if (variants) {
            for (const v of variants) {
              if (results.length >= 4) break;
              if (!v.products?.id || seenProductIds.has(v.products.id)) continue;
              seenProductIds.add(v.products.id);
              results.push({
                id: v.products.id,
                variantId: v.id,
                name: v.products.name,
                category: v.products.category,
                price: parseFloat(v.price || v.products.base_price || 0),
                image: v.image_url || v.products.image_url,
                alt: v.products.name,
                rating: 0,
                reviews: 0
              });
            }
          }
        }

        // Fill remaining slots with recently added products
        if (results.length < 4) {
          const { data: recentProducts } = await supabase
            .from('products')
            .select('id, name, category, image_url, base_price, product_variants(id, price, image_url, stock_quantity)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(20);

          if (recentProducts) {
            for (const p of recentProducts) {
              if (results.length >= 4) break;
              if (seenProductIds.has(p.id)) continue;
              // Only pick a variant that actually has stock
              const inStockVariant = p.product_variants?.find(v => (v.stock_quantity || 0) > 0);
              if (!inStockVariant) continue;
              seenProductIds.add(p.id);
              results.push({
                id: p.id,
                variantId: inStockVariant.id,
                name: p.name,
                category: p.category,
                price: parseFloat(inStockVariant.price || p.base_price || 0),
                image: inStockVariant.image_url || p.image_url,
                alt: p.name,
                rating: 0,
                reviews: 0
              });
            }
          }
        }

        return results;
      } catch (error) {
        console.error('Error loading recommendations:', error);
        return [];
      }
    };

    const loadWishlistCount = async () => {
      try {
        const items = await wishlistService.getWishlistItems(user.id);
        if (isMounted) setWishlistCount(items?.length || 0);
      } catch (error) {
        console.error('Error loading wishlist count:', error);
      }
    };

    const loadData = async () => {
      if (user?.id && isMounted) {
        try {
          setDataLoading(true);
          const [rawDesigns] = await Promise.all([
            loadRecentDesigns(),
            loadOrdersData(),
            loadWishlistCount(),
          ]);
          if (isMounted) {
            const recs = await loadRecommendations(rawDesigns || []);
            if (isMounted) setRecommendations(recs);
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          if (isMounted) setDataLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const dashboardData = {
    userName: userName,
    savedDesigns: totalDesignsCount,
    wishlistItems: wishlistCount,
    orderCount: orderCount,
    actionTiles: [
    {
      id: 1,
      title: "Start New Room Design",
      description: "Upload a room photo and arrange furniture virtually with AI assistance",
      icon: "PencilSquareIcon",
      href: "/virtual-room-designer",
      bgColor: "bg-gradient-to-br from-primary to-primary/80"
    },
    {
      id: 2,
      title: "Browse Furniture Catalog",
      description: "Explore our complete collection of quality furniture pieces",
      icon: "CubeIcon",
      href: "/furniture-catalog",
      bgColor: "bg-gradient-to-br from-secondary to-secondary/80"
    },
    {
      id: 3,
      title: "View My Orders",
      description: `You have ${orderCount} order${orderCount !== 1 ? 's' : ''}. Track purchases and manage delivery schedules`,
      icon: "ShoppingBagIcon",
      href: "/order-history",
      bgColor: "bg-gradient-to-br from-accent to-accent/80"
    }],

    recentDesigns: recentDesigns,

    recommendations: recommendations,

    recentOrders: recentOrders

  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" userName={userName} />
      <main className="pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          {dataLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
                <div className="h-24 bg-muted rounded-lg" />
              </div>
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          ) : (
            <CustomerDashboardInteractive initialData={dashboardData} />
          )}
        </div>
      </main>
    </div>);
}