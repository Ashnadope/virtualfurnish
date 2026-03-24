import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import OrderHistoryInteractive from './components/OrderHistoryInteractive';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order History - VirtualFurnish',
  description: 'View and manage your furniture orders.'
};

export default async function OrderHistoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      payment_method,
      subtotal,
      tax_amount,
      shipping_amount,
      discount_amount,
      total_amount,
      currency,
      shipping_address,
      billing_address,
      notes,
      created_at,
      updated_at,
      order_items (
        id,
        name,
        brand,
        sku,
        variant_name,
        quantity,
        price,
        total,
        products ( id, name, image_url ),
        product_variants ( id, image_url )
      ),
      payment_transactions (
        id,
        amount,
        status,
        gateway,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) console.error('OrderHistory: fetch failed', error);

  const initialOrders = (data ?? []).map(order => ({
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    subtotal: parseFloat(order.subtotal ?? 0),
    taxAmount: parseFloat(order.tax_amount ?? 0),
    shippingAmount: parseFloat(order.shipping_amount ?? 0),
    discountAmount: parseFloat(order.discount_amount ?? 0),
    totalAmount: parseFloat(order.total_amount ?? 0),
    currency: order.currency,
    shippingAddress: order.shipping_address,
    billingAddress: order.billing_address,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: (order.order_items ?? []).map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      sku: item.sku,
      variantName: item.variant_name,
      quantity: item.quantity,
      price: parseFloat(item.price ?? 0),
      total: parseFloat(item.total ?? 0),
      imageUrl: item.product_variants?.image_url ?? item.products?.image_url ?? null
    })),
    transactions: (order.payment_transactions ?? []).map(txn => ({
      id: txn.id,
      amount: parseFloat(txn.amount ?? 0),
      status: txn.status,
      gateway: txn.gateway,
      createdAt: txn.created_at
    }))
  }));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" />
      <main className="pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Order History</h1>
            <p className="text-muted-foreground">View and manage your furniture orders</p>
          </div>
          <OrderHistoryInteractive initialOrders={initialOrders} />
        </div>
      </main>
    </div>
  );
}