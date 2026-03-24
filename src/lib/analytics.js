import { createClient } from '@supabase/supabase-js';

// Use service role so aggregates work across all users (no RLS restriction)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getDateBounds(range) {
  const now = new Date();
  switch (range) {
    case '7days':
      return { start: new Date(now - 7 * 86400000), prev: new Date(now - 14 * 86400000), prevEnd: new Date(now - 7 * 86400000) };
    case '90days':
      return { start: new Date(now - 90 * 86400000), prev: new Date(now - 180 * 86400000), prevEnd: new Date(now - 90 * 86400000) };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        prev: new Date(now.getFullYear() - 1, 0, 1),
        prevEnd: new Date(now.getFullYear(), 0, 1),
      };
    default: // 30days
      return { start: new Date(now - 30 * 86400000), prev: new Date(now - 60 * 86400000), prevEnd: new Date(now - 30 * 86400000) };
  }
}

function pctChange(current, previous) {
  if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
}

function formatNumber(n) {
  return Math.round(n).toLocaleString('en-PH');
}

function getDateLabel(range) {
  switch (range) {
    case '7days':  return 'Last 7 Days';
    case '30days': return 'Last 30 Days';
    case '90days': return 'Last 90 Days';
    case 'year':   return 'This Year';
    default:       return range;
  }
}

export async function fetchAnalyticsData(range = '30days') {
  const supabase = getServiceClient();
  const { start, prev, prevEnd } = getDateBounds(range);
  const now = new Date();

  const [
    { data: currentOrders },
    { data: prevOrders },
    { data: orderItemsRaw },
    { data: allCustomers },
    { data: roomDesigns },
    { count: allTimeDesignCount },
    { data: chartOrders },
    { data: geoOrders },
    { data: products },
    { data: allSucceededOrderUsers },
    { data: variantImages },
  ] = await Promise.all([
    supabase.from('orders').select('id, user_id, total_amount, created_at')
      .eq('payment_status', 'succeeded').gte('created_at', start.toISOString()),

    supabase.from('orders').select('id, total_amount')
      .eq('payment_status', 'succeeded')
      .gte('created_at', prev.toISOString()).lt('created_at', prevEnd.toISOString()),

    supabase.from('order_items')
      .select('product_id, name, quantity, total, orders!inner(payment_status, created_at)')
      .eq('orders.payment_status', 'succeeded')
      .gte('orders.created_at', start.toISOString()),

    supabase.from('user_profiles').select('id, created_at, role').eq('role', 'customer'),

    supabase.from('room_designs').select('id, is_public, is_favorite, design_data, created_at'),

    // All-time total (for headline count — ignores date filter intentionally)
    supabase.from('room_designs').select('id', { count: 'exact', head: true }),

    // Last 12 months for sales chart (always full year regardless of range)
    supabase.from('orders').select('total_amount, created_at')
      .eq('payment_status', 'succeeded')
      .gte('created_at', new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString()),

    supabase.from('orders').select('shipping_address, total_amount')
      .eq('payment_status', 'succeeded').gte('created_at', start.toISOString()),

    supabase.from('products').select('id, name, image_url, category'),

    supabase.from('orders').select('user_id').eq('payment_status', 'succeeded'),

    // Variant images — first image per product (active variants with an image set)
    supabase.from('product_variants')
      .select('product_id, image_url')
      .not('image_url', 'is', null),
  ]);

  // ── Metrics ───────────────────────────────────────────────────────────────
  const totalRevenue = (currentOrders ?? []).reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const prevRevenue  = (prevOrders ?? []).reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const totalOrders   = (currentOrders ?? []).length;
  const prevOrderCount = (prevOrders ?? []).length;
  const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevAvgOrderValue = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

  const newCustomersInPeriod = (allCustomers ?? []).filter(c => new Date(c.created_at) >= start).length;
  const prevNewCustomers     = (allCustomers ?? []).filter(c => new Date(c.created_at) >= prev && new Date(c.created_at) < prevEnd).length;

  const metrics = [
    {
      id: 1, title: 'Total Revenue', value: formatNumber(totalRevenue),
      change: pctChange(totalRevenue, prevRevenue),
      changeType: totalRevenue >= prevRevenue ? 'positive' : 'negative',
      icon: 'CurrencyDollarIcon', currency: true,
    },
    {
      id: 2, title: 'Total Orders', value: formatNumber(totalOrders),
      change: pctChange(totalOrders, prevOrderCount),
      changeType: totalOrders >= prevOrderCount ? 'positive' : 'negative',
      icon: 'ShoppingCartIcon', currency: false,
    },
    {
      id: 3, title: 'Average Order Value', value: formatNumber(avgOrderValue),
      change: pctChange(avgOrderValue, prevAvgOrderValue),
      changeType: avgOrderValue >= prevAvgOrderValue ? 'positive' : 'negative',
      icon: 'ChartBarIcon', currency: true,
    },
    {
      id: 4, title: 'New Customers', value: formatNumber(newCustomersInPeriod),
      change: pctChange(newCustomersInPeriod, prevNewCustomers),
      changeType: newCustomersInPeriod >= prevNewCustomers ? 'positive' : 'negative',
      icon: 'UsersIcon', currency: false,
    },
  ];

  // ── Sales chart — monthly buckets (last 12 months) ────────────────────────
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const buckets = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = { month: monthLabels[d.getMonth()], revenue: 0, orders: 0 };
  }
  for (const order of (chartOrders ?? [])) {
    const d = new Date(order.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets[key]) { buckets[key].revenue += parseFloat(order.total_amount); buckets[key].orders++; }
  }
  const salesData = Object.values(buckets).map(b => ({ ...b, revenue: Math.round(b.revenue) }));

  // ── Top products ──────────────────────────────────────────────────────────
  const productMap = {};
  for (const item of (orderItemsRaw ?? [])) {
    const key = item.product_id || item.name;
    if (!productMap[key]) productMap[key] = { id: key, product_id: item.product_id, name: item.name, unitsSold: 0, revenue: 0 };
    productMap[key].unitsSold += item.quantity;
    productMap[key].revenue  += parseFloat(item.total);
  }
  const productLookup = {};
  for (const p of (products ?? [])) productLookup[p.id] = p;

  // First variant image per product (variant takes priority over product-level image)
  const variantImageLookup = {};
  for (const v of (variantImages ?? [])) {
    if (v.product_id && v.image_url && !variantImageLookup[v.product_id]) {
      variantImageLookup[v.product_id] = v.image_url;
    }
  }

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)
    .map(p => {
      const prod = productLookup[p.product_id];
      // Prefer variant image → fall back to product-level image (seeded data)
      const image = variantImageLookup[p.product_id] || prod?.image_url || null;
      return {
        id: p.id, name: p.name,
        category: prod?.category || '—',
        unitsSold: p.unitsSold,
        revenue: formatNumber(p.revenue),
        image,
        trend: 'stable', trendValue: '',
      };
    });

  // ── Customer segments ─────────────────────────────────────────────────────
  const totalOrdersPerUser = {};
  for (const o of (allSucceededOrderUsers ?? [])) {
    if (o.user_id) totalOrdersPerUser[o.user_id] = (totalOrdersPerUser[o.user_id] || 0) + 1;
  }
  const totalCustomers   = (allCustomers ?? []).length;
  const returningCount   = Object.values(totalOrdersPerUser).filter(n => n >= 2).length;
  const oneTimeCount     = Object.values(totalOrdersPerUser).filter(n => n === 1).length;
  const inactiveCount    = Math.max(0, totalCustomers - Object.keys(totalOrdersPerUser).length);

  const customerSegments = [
    { name: 'New Customers',     value: Math.max(0, newCustomersInPeriod) },
    { name: 'Returning Customers', value: Math.max(0, returningCount) },
    { name: 'One-Time Buyers',   value: Math.max(0, oneTimeCount) },
    { name: 'No Orders Yet',     value: Math.max(0, inactiveCount) },
  ];

  // ── Room designer stats ───────────────────────────────────────────────────
  const allDesigns        = roomDesigns ?? [];
  // All-time headline (from the count-only query — no data transfer overhead)
  const totalDesigns      = allTimeDesignCount ?? allDesigns.length;

  // Scope all per-period metrics to the selected date range so the stats
  // respond correctly when the user switches between weekly / monthly / etc.
  const periodDesigns     = allDesigns.filter(d => new Date(d.created_at) >= start);
  const prevPeriodDesigns = allDesigns.filter(d => new Date(d.created_at) >= prev && new Date(d.created_at) < prevEnd);

  const designsInPeriod   = periodDesigns.length;
  const prevDesigns       = prevPeriodDesigns.length;

  // Period-scoped sub-counts
  const publicDesigns     = periodDesigns.filter(d => d.is_public).length;
  const withFurniture     = periodDesigns.filter(d => Array.isArray(d.design_data?.furniture) && d.design_data.furniture.length > 0).length;
  const withAiAnalysis    = periodDesigns.filter(d => !!d.design_data?.aiAnalysis).length;

  // Prev-period equivalents for % change comparisons
  const prevPublic        = prevPeriodDesigns.filter(d => d.is_public).length;
  const prevFurniture     = prevPeriodDesigns.filter(d => Array.isArray(d.design_data?.furniture) && d.design_data.furniture.length > 0).length;
  const prevAi            = prevPeriodDesigns.filter(d => !!d.design_data?.aiAnalysis).length;

  const furniturePct      = designsInPeriod > 0 ? ((withFurniture / designsInPeriod) * 100).toFixed(1) : '0';
  const aiPct             = designsInPeriod > 0 ? ((withAiAnalysis / designsInPeriod) * 100).toFixed(1) : '0';
  const publicPct         = designsInPeriod > 0 ? ((publicDesigns / designsInPeriod) * 100).toFixed(1) : '0';

  const periodLabel = getDateLabel(range);

  const roomDesignerStats = [
    { id: 1, label: 'Total Designs Created', description: 'All-time room designs', value: totalDesigns.toLocaleString(), change: pctChange(designsInPeriod, prevDesigns), changeType: designsInPeriod >= prevDesigns ? 'positive' : 'negative' },
    { id: 2, label: 'Designs This Period',   description: `New designs — ${periodLabel}`, value: designsInPeriod.toLocaleString(), change: pctChange(designsInPeriod, prevDesigns), changeType: designsInPeriod >= prevDesigns ? 'positive' : 'negative' },
    { id: 3, label: 'Furniture Placed',      description: `Designs with items placed — ${periodLabel}`, value: withFurniture.toLocaleString(), change: `${furniturePct}% · ${pctChange(withFurniture, prevFurniture)} vs prev`, changeType: withFurniture >= prevFurniture ? 'positive' : 'negative' },
    { id: 4, label: 'AI-Analysed Rooms',     description: `Designs with AI analysis — ${periodLabel}`, value: withAiAnalysis.toLocaleString(), change: `${aiPct}% · ${pctChange(withAiAnalysis, prevAi)} vs prev`, changeType: withAiAnalysis >= prevAi ? 'positive' : 'negative' },
    { id: 5, label: 'Shared Designs',        description: `Designs made public — ${periodLabel}`, value: publicDesigns.toLocaleString(), change: `${publicPct}% · ${pctChange(publicDesigns, prevPublic)} vs prev`, changeType: publicDesigns >= prevPublic ? 'positive' : 'negative' },
  ];

  // ── Geographic distribution ───────────────────────────────────────────────
  const cityMap = {};
  for (const order of (geoOrders ?? [])) {
    const addr = order.shipping_address;
    const city = addr?.city || addr?.address_line_2 || 'Unknown';
    if (!cityMap[city]) cityMap[city] = { orders: 0, revenue: 0 };
    cityMap[city].orders++;
    cityMap[city].revenue += parseFloat(order.total_amount);
  }
  const totalGeoOrders = (geoOrders ?? []).length;
  const geographicData = Object.entries(cityMap)
    .sort((a, b) => b[1].orders - a[1].orders)
    .slice(0, 5)
    .map(([city, d], i) => ({
      id: i + 1, name: city, orders: d.orders,
      revenue: formatNumber(d.revenue),
      percentage: totalGeoOrders > 0 ? ((d.orders / totalGeoOrders) * 100).toFixed(1) : '0',
    }));

  return { metrics, salesData, topProducts, customerSegments, roomDesignerStats, geographicData };
}
