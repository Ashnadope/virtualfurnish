import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CustomerDashboardInteractive from './components/CustomerDashboardInteractive';

// Force dynamic rendering — page is always user-specific
export const dynamic = 'force-dynamic';

export default async function CustomerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // ── Parallel initial queries ────────────────────────────────────────────────
  const [profileResult, ordersResult, designsResult, wishlistResult] =
    await Promise.all([
      supabase.from('user_profiles').select('first_name').eq('id', user.id).single(),
      supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at, order_items(id, name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('room_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase.from('wishlist_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

  const userName =
    profileResult.data?.first_name || user.email?.split('@')?.[0] || 'Customer';
  const orders = ordersResult.data || [];
  const designs = designsResult.data || [];
  const wishlistCount = wishlistResult.count ?? 0;

  // ── Recent orders (top 3) ───────────────────────────────────────────────────
  const recentOrders = orders.slice(0, 3).map(order => ({
    orderNumber: order.order_number,
    productName: order.order_items?.[0]?.name || 'Order',
    status: order.status || 'pending',
    orderDate: new Date(order.created_at).toLocaleDateString('en-PH'),
    totalAmount: parseFloat(order.total_amount || 0),
  }));

  // ── Recent designs with signed thumbnail URLs ───────────────────────────────
  const totalDesignsCount = designs.length;
  const recentDesigns = await Promise.all(
    designs.slice(0, 3).map(async (design) => {
      const imagePath = design.render_url || design.room_image_url;
      let signedUrl = null;
      if (imagePath) {
        const bucket = imagePath.includes('/render-') ? 'design-renders' : 'room-uploads';
        const { data } = await supabase.storage
          .from(bucket)
          .createSignedUrl(imagePath, 3600);
        signedUrl = data?.signedUrl || null;
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
        share_token: design.share_token,
      };
    })
  );

  // ── Recommendations (AI variant IDs → recent products as fallback) ──────────
  const seenVariantIds = new Set();
  const aiVariantIds = [];
  for (const design of designs) {
    for (const rec of design.design_data?.aiAnalysis?.furnitureRecommendations || []) {
      if (rec.furnitureId && !seenVariantIds.has(rec.furnitureId)) {
        seenVariantIds.add(rec.furnitureId);
        aiVariantIds.push(rec.furnitureId);
      }
    }
  }

  const recommendations = [];
  const seenProductIds = new Set();

  if (aiVariantIds.length > 0) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, image_url, price, stock_quantity, products(id, name, category, image_url, base_price)')
      .in('id', aiVariantIds)
      .gt('stock_quantity', 0);

    for (const v of variants || []) {
      if (recommendations.length >= 4) break;
      if (!v.products?.id || seenProductIds.has(v.products.id)) continue;
      seenProductIds.add(v.products.id);
      recommendations.push({
        id: v.products.id, variantId: v.id,
        name: v.products.name, category: v.products.category,
        price: parseFloat(v.price || v.products.base_price || 0),
        image: v.image_url || v.products.image_url,
        alt: v.products.name, rating: 0, reviews: 0,
      });
    }
  }

  if (recommendations.length < 4) {
    const { data: recentProducts } = await supabase
      .from('products')
      .select('id, name, category, image_url, base_price, product_variants(id, price, image_url, stock_quantity)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    for (const p of recentProducts || []) {
      if (recommendations.length >= 4) break;
      if (seenProductIds.has(p.id)) continue;
      const inStockVariant = p.product_variants?.find(v => (v.stock_quantity || 0) > 0);
      if (!inStockVariant) continue;
      seenProductIds.add(p.id);
      recommendations.push({
        id: p.id, variantId: inStockVariant.id,
        name: p.name, category: p.category,
        price: parseFloat(inStockVariant.price || p.base_price || 0),
        image: inStockVariant.image_url || p.image_url,
        alt: p.name, rating: 0, reviews: 0,
      });
    }
  }

  // ── Build dashboard data payload ────────────────────────────────────────────
  const orderCount = orders.length;
  const dashboardData = {
    userName,
    savedDesigns: totalDesignsCount,
    wishlistItems: wishlistCount,
    orderCount,
    actionTiles: [
      {
        id: 1,
        title: 'Start New Room Design',
        description: 'Upload a room photo and arrange furniture virtually with AI assistance',
        icon: 'PencilSquareIcon',
        href: '/virtual-room-designer',
        bgColor: 'bg-gradient-to-br from-primary to-primary/80',
      },
      {
        id: 2,
        title: 'Browse Furniture Catalog',
        description: 'Explore our complete collection of quality furniture pieces',
        icon: 'CubeIcon',
        href: '/furniture-catalog',
        bgColor: 'bg-gradient-to-br from-secondary to-secondary/80',
      },
      {
        id: 3,
        title: 'View My Orders',
        description: `You have ${orderCount} order${orderCount !== 1 ? 's' : ''}. Track purchases and manage delivery schedules`,
        icon: 'ShoppingBagIcon',
        href: '/order-history',
        bgColor: 'bg-gradient-to-br from-accent to-accent/80',
      },
    ],
    recentDesigns,
    recommendations,
    recentOrders,
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
          <CustomerDashboardInteractive initialData={dashboardData} />
        </div>
      </main>
    </div>
  );
}