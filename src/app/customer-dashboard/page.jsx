import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CustomerDashboardInteractive from './components/CustomerDashboardInteractive';

export const metadata = {
  title: 'Customer Dashboard - VirtualFurnish',
  description: 'Access virtual room design tools, browse furniture catalog, and manage your orders at Brosas Furniture Store.'
};

export default function CustomerDashboard() {
  const dashboardData = {
    userName: "Maryjoy and Joel",
    savedDesigns: 5,
    wishlistItems: 12,
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
      href: "/customer-dashboard",
      bgColor: "bg-gradient-to-br from-secondary to-secondary/80"
    },
    {
      id: 3,
      title: "View My Orders",
      description: "Track your purchases and manage delivery schedules",
      icon: "ShoppingBagIcon",
      href: "/customer-dashboard",
      bgColor: "bg-gradient-to-br from-accent to-accent/80"
    }],

    recentDesigns: [
    {
      id: 1,
      name: "Living Room Makeover",
      thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_14eb753f8-1764845698055.png",
      alt: "Modern living room with gray sectional sofa, wooden coffee table, and white walls with large windows",
      date: "05/12/2025",
      itemCount: 8,
      roomType: "Living Room"
    },
    {
      id: 2,
      name: "Bedroom Refresh",
      thumbnail: "https://images.unsplash.com/photo-1560184897-f1b9fd4e5d25",
      alt: "Cozy bedroom with queen-size bed, white bedding, wooden nightstands, and warm ambient lighting",
      date: "03/12/2025",
      itemCount: 6,
      roomType: "Bedroom"
    },
    {
      id: 3,
      name: "Dining Area Setup",
      thumbnail: "https://images.unsplash.com/photo-1722764375892-32aa3e1811da",
      alt: "Elegant dining room with wooden table, six upholstered chairs, and pendant lighting fixture",
      date: "01/12/2025",
      itemCount: 5,
      roomType: "Dining Room"
    }],

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