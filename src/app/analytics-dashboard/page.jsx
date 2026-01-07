import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AnalyticsInteractive from './components/AnalyticsInteractive';

export const metadata = {
  title: 'Analytics Dashboard - VirtualFurnish',
  description: 'Comprehensive business insights and performance metrics for data-driven decision making at Brosas Furniture Store'
};

export default function AnalyticsDashboard() {
  const analyticsData = {
    metrics: [
    {
      id: 1,
      title: 'Total Revenue',
      value: '2,847,500',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'CurrencyDollarIcon',
      currency: true
    },
    {
      id: 2,
      title: 'Order Conversion Rate',
      value: '18.4%',
      change: '+3.2%',
      changeType: 'positive',
      icon: 'ChartBarIcon',
      currency: false
    },
    {
      id: 3,
      title: 'Average Order Value',
      value: '45,890',
      change: '+8.1%',
      changeType: 'positive',
      icon: 'ShoppingCartIcon',
      currency: true
    },
    {
      id: 4,
      title: 'Customer Acquisition',
      value: '1,247',
      change: '-2.3%',
      changeType: 'negative',
      icon: 'UsersIcon',
      currency: false
    }],

    salesData: [
    { month: 'Jan', revenue: 185000, orders: 42 },
    { month: 'Feb', revenue: 210000, orders: 48 },
    { month: 'Mar', revenue: 245000, orders: 55 },
    { month: 'Apr', revenue: 280000, orders: 62 },
    { month: 'May', revenue: 320000, orders: 71 },
    { month: 'Jun', revenue: 295000, orders: 65 },
    { month: 'Jul', revenue: 340000, orders: 78 },
    { month: 'Aug', revenue: 375000, orders: 84 },
    { month: 'Sep', revenue: 410000, orders: 92 },
    { month: 'Oct', revenue: 385000, orders: 87 },
    { month: 'Nov', revenue: 425000, orders: 96 },
    { month: 'Dec', revenue: 377500, orders: 85 }],

    topProducts: [
    {
      id: 1,
      name: 'Modern L-Shaped Sofa',
      category: 'Living Room',
      unitsSold: 156,
      revenue: '1,248,000',
      trend: 'up',
      trendValue: '+15%',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_14eb753f8-1764845698055.png",
      alt: 'Modern gray L-shaped sectional sofa with clean lines in contemporary living room setting'
    },
    {
      id: 2,
      name: 'Solid Wood Dining Table',
      category: 'Dining Room',
      unitsSold: 124,
      revenue: '992,000',
      trend: 'up',
      trendValue: '+22%',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f054d569-1764651051733.png",
      alt: 'Rustic solid wood rectangular dining table with natural grain finish and matching chairs'
    },
    {
      id: 3,
      name: 'Queen Size Platform Bed',
      category: 'Bedroom',
      unitsSold: 98,
      revenue: '784,000',
      trend: 'stable',
      trendValue: '+2%',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1bc807347-1764674987260.png",
      alt: 'Contemporary queen size platform bed with upholstered headboard in neutral bedroom'
    },
    {
      id: 4,
      name: 'Executive Office Desk',
      category: 'Office',
      unitsSold: 87,
      revenue: '696,000',
      trend: 'up',
      trendValue: '+18%',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ed4001b8-1764664382511.png",
      alt: 'Modern executive office desk with dark wood finish and metal legs in professional workspace'
    },
    {
      id: 5,
      name: 'Recliner Armchair',
      category: 'Living Room',
      unitsSold: 76,
      revenue: '608,000',
      trend: 'down',
      trendValue: '-5%',
      image: "https://images.unsplash.com/photo-1676294360079-902937040b4f",
      alt: 'Comfortable brown leather recliner armchair with padded cushions and adjustable footrest'
    }],

    customerSegments: [
    { name: 'New Customers', value: 342 },
    { name: 'Returning Customers', value: 568 },
    { name: 'VIP Customers', value: 124 },
    { name: 'Inactive Customers', value: 213 }],

    roomDesignerStats: [
    {
      id: 1,
      label: 'Total Designs Created',
      description: 'Rooms designed using virtual tool',
      value: '3,847',
      change: '+24%',
      changeType: 'positive'
    },
    {
      id: 2,
      label: 'AI Suggestions Accepted',
      description: 'Users who followed AI recommendations',
      value: '67.8%',
      change: '+12%',
      changeType: 'positive'
    },
    {
      id: 3,
      label: 'Average Design Time',
      description: 'Time spent per room design',
      value: '18 min',
      change: '-3 min',
      changeType: 'positive'
    },
    {
      id: 4,
      label: 'Conversion to Purchase',
      description: 'Designs that led to orders',
      value: '42.3%',
      change: '+8%',
      changeType: 'positive'
    }],

    geographicData: [
    {
      id: 1,
      name: 'Metro Manila',
      orders: 487,
      revenue: '1,948,000',
      percentage: '42.5'
    },
    {
      id: 2,
      name: 'Cebu',
      orders: 312,
      revenue: '1,248,000',
      percentage: '27.2'
    },
    {
      id: 3,
      name: 'Davao',
      orders: 198,
      revenue: '792,000',
      percentage: '17.3'
    },
    {
      id: 4,
      name: 'Iloilo',
      orders: 124,
      revenue: '496,000',
      percentage: '10.8'
    },
    {
      id: 5,
      name: 'Other Regions',
      orders: 26,
      revenue: '104,000',
      percentage: '2.2'
    }]

  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="admin" />
      <Header userRole="admin" userName="Admin User" />
      
      <main className="lg:ml-sidebar pt-16">
        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <Breadcrumb />
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="font-body text-muted-foreground">Comprehensive business insights and performance metrics for strategic decision making</p>
          </div>

          <AnalyticsInteractive initialData={analyticsData} />
        </div>
      </main>
    </div>);

}