'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CustomerDashboardInteractive from './components/CustomerDashboardInteractive';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/order.service';
import { roomDesignService } from '@/services/roomDesign.service';
import { createClient } from '@/lib/supabase/client';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [userName, setUserName] = useState('Customer');
  const [recentDesigns, setRecentDesigns] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading user data:', error);
          setUserName('Customer');
          return;
        }

        if (data?.full_name) {
          // Extract first name (everything before the first space)
          const firstName = data.full_name.split(' ')[0];
          setUserName(firstName);
        } else {
          setUserName('Customer');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserName('Customer');
      }
    };

    const loadOrderCount = async () => {
      try {
        const orders = await orderService.getUserOrders(user.id);
        setOrderCount(orders?.length || 0);
      } catch (error) {
        console.error('Error loading order count:', error);
        setOrderCount(0);
      }
    };

    const loadRecentDesigns = async () => {
      try {
        const { data, error } = await roomDesignService.getUserDesigns(user.id);
        
        if (error) {
          console.error('Error loading designs:', error);
          setRecentDesigns([]);
          return;
        }

        if (!data || data.length === 0) {
          setRecentDesigns([]);
          return;
        }

        // Get latest 3 designs with signed URLs
        const latest3 = data.slice(0, 3);
        const designsWithUrls = await Promise.all(
          latest3.map(async (design) => {
            try {
              // Use render_url if available, otherwise fall back to room_image_url
              const imagePath = design.render_url || design.room_image_url;
              
              // Only get signed URL if we have an image path
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
            } catch (err) {
              console.error('Error processing design:', design.id, err);
              // Return design with null thumbnail on error
              return {
                id: design.id,
                name: design.name,
                thumbnail: null,
                alt: design.description || design.name,
                date: new Date(design.updated_at).toLocaleDateString(),
                itemCount: design.design_data?.furniture?.length || 0,
                roomType: design.name,
                is_public: design.is_public,
                share_token: design.share_token
              };
            }
          })
        );
        
        setRecentDesigns(designsWithUrls);
      } catch (error) {
        console.error('Error loading recent designs:', error);
        setRecentDesigns([]);
      }
    };

    const loadData = async () => {
      if (user?.id && isMounted) {
        try {
          // Load data sequentially to avoid auth lock conflicts
          await loadUserData();
          if (isMounted) await loadOrderCount();
          if (isMounted) await loadRecentDesigns();
        } catch (error) {
          console.error('Error loading dashboard data:', error);
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
    savedDesigns: recentDesigns.length,
    wishlistItems: 12,
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

    recommendations: [
    {
      id: 1,
      name: "Modern Fabric Sofa - 3 Seater",
      category: "Living Room",
      price: 24999,
      discountedPrice: 19999,
      discount: 20,
      image: "https://images.unsplash.com/photo-1634497885778-152eb6fd543d",
      alt: "Three-seater modern fabric sofa in charcoal gray with clean lines and wooden legs",
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: "Solid Wood Coffee Table",
      category: "Living Room",
      price: 8999,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_169f683f9-1764651057136.png",
      alt: "Rectangular coffee table made of solid oak wood with natural finish and lower shelf",
      rating: 4.8,
      reviews: 95
    },
    {
      id: 3,
      name: "Queen Size Bed Frame",
      category: "Bedroom",
      price: 15999,
      discountedPrice: 13599,
      discount: 15,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_19a59142e-1764752238242.png",
      alt: "Queen-size bed frame with upholstered headboard in beige fabric and wooden slats",
      rating: 4.6,
      reviews: 76
    },
    {
      id: 4,
      name: "6-Seater Dining Set",
      category: "Dining Room",
      price: 32999,
      image: "https://images.unsplash.com/photo-1708716069493-d40f14738e03",
      alt: "Complete dining set with rectangular wooden table and six cushioned chairs in dark brown finish",
      rating: 4.7,
      reviews: 54
    }],

    recentOrders: [
    {
      orderNumber: "ORD-2025-1234",
      productName: "L-Shaped Corner Sofa",
      status: "In Transit",
      orderDate: "02/12/2025",
      estimatedDelivery: "08/12/2025",
      totalAmount: 35999
    },
    {
      orderNumber: "ORD-2025-1189",
      productName: "Wooden Bookshelf",
      status: "Delivered",
      orderDate: "28/11/2025",
      estimatedDelivery: "04/12/2025",
      totalAmount: 6499
    },
    {
      orderNumber: "ORD-2025-1156",
      productName: "Office Desk with Drawers",
      status: "Processing",
      orderDate: "05/12/2025",
      estimatedDelivery: "12/12/2025",
      totalAmount: 12999
    }]

  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" userName={dashboardData?.userName} />
      <main className="lg:ml-sidebar pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          <CustomerDashboardInteractive initialData={dashboardData} />
        </div>
      </main>
    </div>);

}