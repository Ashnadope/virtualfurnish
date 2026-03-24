import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AnalyticsInteractive from './components/AnalyticsInteractive';
import { fetchAnalyticsData } from '@/lib/analytics';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Analytics Dashboard - VirtualFurnish',
  description: 'Comprehensive business insights and performance metrics for data-driven decision making at Brosas Furniture Store'
};

export default async function AnalyticsDashboard() {
  let analyticsData;
  try {
    analyticsData = await fetchAnalyticsData('30days');
  } catch (e) {
    console.error('[AnalyticsDashboard] Failed to fetch analytics:', e);
  }

  // Fallback shape so the page never crashes on DB error
  analyticsData ??= {
    metrics: [],
    salesData: [],
    topProducts: [],
    customerSegments: [],
    roomDesignerStats: [],
    geographicData: [],
  };

  /* ── hardcoded data removed ── */

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="admin" />
      <Header userRole="admin" userName="Admin User" />
      
      <main className="pt-16">
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
    </div>
  );
}
