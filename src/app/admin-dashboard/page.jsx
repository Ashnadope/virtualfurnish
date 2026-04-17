import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AdminDashboardInteractive from './components/AdminDashboardInteractive';
import AdminProtection from './components/AdminProtection';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard - VirtualFurnish',
  description: 'Monitor business operations, manage inventory, process orders, and access analytics for Brosas Furniture Store.'
};

function formatPercent(current, previous) {
  if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function formatRelativeTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const [
    todayOrdersRes,
    yesterdayOrdersRes,
    inventoryCountRes,
    customersTodayRes,
    customersYesterdayRes,
    recentOrdersRes,
    salesChartRes,
    pendingOrdersRes,
    lowStockRes,
    recentInquiriesRes,
  ] = await Promise.all([
    // Today's succeeded orders (for sales + order count)
    supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'succeeded')
      .gte('created_at', todayStart),

    // Yesterday's succeeded orders (for % change)
    supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'succeeded')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),

    // Low-stock variant count (for metrics card)
    supabase
      .from('product_variants')
      .select('id, products!inner(id)', { count: 'exact', head: true })
      .lte('stock_quantity', 5)
      .eq('is_active', true)
      .eq('products.is_archived', false),

    // New customers today
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', todayStart),

    // New customers yesterday (for % change)
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),

    // 6 most recently updated orders for the activity feed
    supabase
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, updated_at, user_profiles(first_name, last_name)')
      .order('updated_at', { ascending: false })
      .limit(6),

    // All orders from Jan 1 this year — lets us build week, month, and year chart views
    supabase
      .from('orders')
      .select('total_amount, created_at, payment_status')
      .gte('created_at', yearStart)
      .order('created_at', { ascending: true }),

    // Pending / processing orders for the orders table
    supabase
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, user_profiles(first_name, last_name), order_items(id)')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(5),

    // Low-stock variants for the inventory alerts panel
    supabase
      .from('product_variants')
      .select('id, product_id, name, sku, stock_quantity, image_url, products!inner(id, name, image_url, image_alt)')
      .lte('stock_quantity', 5)
      .eq('is_active', true)
      .eq('products.is_archived', false)
      .order('stock_quantity', { ascending: true })
      .limit(6),
    // Recent unread customer messages for the activity feed
    supabase
      .from('support_messages')
      .select('id, user_id, order_number, message, created_at')
      .eq('sender_role', 'customer')
      .eq('is_read_by_admin', false)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  // ── Metrics ────────────────────────────────────────────────
  const todaySales = (todayOrdersRes.data ?? []).reduce((s, o) => s + parseFloat(o.total_amount ?? 0), 0);
  const yesterdaySales = (yesterdayOrdersRes.data ?? []).reduce((s, o) => s + parseFloat(o.total_amount ?? 0), 0);
  const todayOrderCount = todayOrdersRes.data?.length ?? 0;
  const yesterdayOrderCount = yesterdayOrdersRes.data?.length ?? 0;
  const inventoryAlertCount = inventoryCountRes.count ?? 0;
  const newCustomersToday = customersTodayRes.count ?? 0;
  const newCustomersYesterday = customersYesterdayRes.count ?? 0;

  const metrics = [
    {
      id: 1,
      title: "Today's Sales",
      value: `₱${todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      change: formatPercent(todaySales, yesterdaySales),
      changeType: todaySales >= yesterdaySales ? 'positive' : 'negative',
      icon: 'CurrencyDollarIcon',
      iconBg: 'bg-success',
    },
    {
      id: 2,
      title: 'Orders Today',
      value: String(todayOrderCount),
      change: formatPercent(todayOrderCount, yesterdayOrderCount),
      changeType: todayOrderCount >= yesterdayOrderCount ? 'positive' : 'negative',
      icon: 'ShoppingBagIcon',
      iconBg: 'bg-primary',
    },
    {
      id: 3,
      title: 'Inventory Alerts',
      value: String(inventoryAlertCount),
      change: inventoryAlertCount > 0 ? `${inventoryAlertCount} low stock` : 'All stocked',
      changeType: inventoryAlertCount > 0 ? 'negative' : 'positive',
      icon: 'ExclamationTriangleIcon',
      iconBg: 'bg-warning',
    },
    {
      id: 4,
      title: 'New Customers',
      value: String(newCustomersToday),
      change: formatPercent(newCustomersToday, newCustomersYesterday),
      changeType: newCustomersToday >= newCustomersYesterday ? 'positive' : 'negative',
      icon: 'UserGroupIcon',
      iconBg: 'bg-accent',
    },
  ];

  // ── Sales chart — three views: Week (7 days), Month (30 days), Year (12 months) ──
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const succeededChartOrders = (salesChartRes.data ?? []).filter(o => o.payment_status === 'succeeded');

  // Week: last 7 days as daily buckets
  const weekBuckets = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    weekBuckets[d.toLocaleDateString('en-PH', { day: '2-digit', month: 'short' })] = 0;
  }
  // Month: last 30 days as daily buckets
  const monthBuckets = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    monthBuckets[d.toLocaleDateString('en-PH', { day: '2-digit', month: 'short' })] = 0;
  }
  // Year: Jan–Dec monthly buckets
  const yearBuckets = Object.fromEntries(MONTH_LABELS.map(m => [m, 0]));

  for (const order of succeededChartOrders) {
    const d = new Date(order.created_at);
    const dayKey = d.toLocaleDateString('en-PH', { day: '2-digit', month: 'short' });
    const amount = parseFloat(order.total_amount ?? 0);
    if (dayKey in weekBuckets)  weekBuckets[dayKey]  += amount;
    if (dayKey in monthBuckets) monthBuckets[dayKey] += amount;
    if (d.getFullYear() === now.getFullYear()) yearBuckets[MONTH_LABELS[d.getMonth()]] += amount;
  }

  const salesDataByRange = {
    week:  Object.entries(weekBuckets).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) })),
    month: Object.entries(monthBuckets).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) })),
    year:  MONTH_LABELS.map(m => ({ date: m, revenue: Math.round(yearBuckets[m]) })),
  };

  // ── Recent activity feed ─────────────────────────────────────
  const orderActivities = (recentOrdersRes.data ?? []).map((order) => {
    const p = order.user_profiles;
    const name = p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Customer' : 'Customer';
    const amount = `₱${parseFloat(order.total_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const isPending = order.status === 'pending';
    const isCancelled = order.status === 'cancelled';
    const activityTime = isPending ? order.created_at : (order.updated_at || order.created_at);
    const statusLabel = {
      pending: 'New Order Received',
      processing: 'Order Processing',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled',
      disputed: 'Order Disputed',
    }[order.status] ?? `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`;
    return {
      _sortTime: new Date(activityTime).getTime(),
      type: 'order',
      orderNumber: order.order_number,
      title: statusLabel,
      description: `Order #${order.order_number} from ${name} — ${amount}`,
      time: formatRelativeTime(activityTime),
      priority: isPending || isCancelled ? 'high' : 'normal',
    };
  });

  // Fetch profiles for inquiry messages separately (FK hint caused silent failures)
  const inquiryUserIds = [...new Set((recentInquiriesRes.data ?? []).map(m => m.user_id))];
  let inquiryProfileMap = {};
  if (inquiryUserIds.length > 0) {
    const { data: iProfiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', inquiryUserIds);
    for (const p of (iProfiles ?? [])) {
      inquiryProfileMap[p.id] = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Customer';
    }
  }

  const inquiryActivities = (recentInquiriesRes.data ?? []).map((msg) => {
    const name = inquiryProfileMap[msg.user_id] || 'Customer';
    return {
      _sortTime: new Date(msg.created_at).getTime(),
      type: 'inquiry',
      userId: msg.user_id,
      orderNumber: msg.order_number || null,
      title: msg.order_number ? 'Order Inquiry' : 'Customer Inquiry',
      description: msg.order_number
        ? `${name} on Order #${msg.order_number}`
        : `${name} asked a question`,
      time: formatRelativeTime(msg.created_at),
      priority: 'normal',
    };
  });

  // Merge orders + inquiries, sort newest first (no slice — tab filter handles display)
  const merged = [...orderActivities, ...inquiryActivities]
    .sort((a, b) => b._sortTime - a._sortTime)
    .map((item, idx) => ({ ...item, id: idx + 1 }));

  const recentActivities = merged;

  // Append low-stock alerts at the bottom of the feed
  (lowStockRes.data ?? []).slice(0, 3).forEach((variant, idx) => {
    const productName = variant.products?.name ?? variant.name;
    recentActivities.push({
      id: recentActivities.length + idx + 1,
      type: 'alert',
      sku: variant.sku ?? null,
      title: 'Low Stock Alert',
      description: `${productName} (${variant.name}) has only ${variant.stock_quantity} unit${variant.stock_quantity === 1 ? '' : 's'} remaining`,
      time: 'Now',
      priority: 'high',
    });
  });

  // ── Inventory alerts panel ────────────────────────────────────
  const inventoryAlerts = (lowStockRes.data ?? []).map((v, idx) => ({
    id: idx + 1,
    productId: v.product_id,
    name: v.products?.name ?? v.name,
    sku: v.sku ?? '—',
    stock: v.stock_quantity ?? 0,
    image: v.image_url || v.products?.image_url || 'https://placehold.co/64x64?text=No+Image',
    alt: v.products?.name ?? v.name,
  }));

  // ── Pending orders table ──────────────────────────────────────
  const pendingOrders = (pendingOrdersRes.data ?? []).map((order, idx) => {
    const p = order.user_profiles;
    const name = p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Customer' : 'Customer';
    return {
      id: idx + 1,
      orderNumber: order.order_number,
      customerName: name,
      items: order.order_items?.length ?? 0,
      total: parseFloat(order.total_amount ?? 0),
      date: new Date(order.created_at).toLocaleDateString('en-PH'),
      status: order.status,
    };
  });

  const quickActions = [
    { id: 1, title: 'Add New Product',  description: 'Create and list new furniture items',    icon: 'PlusCircleIcon',              iconBg: 'bg-primary', href: '/product-management' },
    { id: 2, title: 'Process Orders',   description: 'Review and fulfill pending orders',       icon: 'ClipboardDocumentCheckIcon',  iconBg: 'bg-success', href: '/admin-orders' },
    { id: 3, title: 'Manage Inventory', description: 'Update stock levels and pricing',         icon: 'CubeIcon',                    iconBg: 'bg-warning', href: '/product-management' },
    { id: 4, title: 'View Analytics',   description: 'Access sales reports and insights',       icon: 'ChartBarIcon',                iconBg: 'bg-accent',  href: '/analytics-dashboard' },
  ];

  const dashboardData = { metrics, quickActions, recentActivities, inventoryAlerts, salesDataByRange, pendingOrders };

  return (
    <AdminProtection>
      <div className="min-h-screen bg-background">
        <Sidebar userRole="admin" />
        <Header userRole="admin" userName="Admin" />

        <main className="pt-16">
          <div className="p-6 lg:p-8">
            <div className="mb-6">
              <Breadcrumb />
              <h1 className="font-heading text-3xl font-bold text-foreground mt-4 mb-2">Admin Dashboard</h1>
              <p className="font-body text-base text-muted-foreground">
                Monitor business operations and manage Brosas Furniture Store
              </p>
            </div>

            <AdminDashboardInteractive initialData={dashboardData} />
          </div>
        </main>
      </div>
    </AdminProtection>
  );
}