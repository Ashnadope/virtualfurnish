import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AdminOrdersInteractive from './components/AdminOrdersInteractive';
import AdminProtection from '@/app/admin-dashboard/components/AdminProtection';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Orders - VirtualFurnish Admin',
  description: 'Manage and track all customer orders.'
};

export default async function AdminOrders() {
  const supabase = await createClient();

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
      user_id,
      user_profiles (
        id,
        email,
        first_name,
        last_name,
        phone
      ),
      order_items (
        id,
        name,
        brand,
        sku,
        variant_name,
        quantity,
        price,
        total
      ),
      payment_transactions (
        id,
        amount,
        status,
        gateway,
        gcash_reference_id,
        metadata,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('AdminOrders: failed to fetch orders', error);
  }

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
    customerId: order.user_id,
    customer: {
      id: order.user_profiles?.id ?? null,
      email: order.user_profiles?.email ?? '',
      firstName: order.user_profiles?.first_name ?? '',
      lastName: order.user_profiles?.last_name ?? '',
      phone: order.user_profiles?.phone ?? '',
      fullName: `${order.user_profiles?.first_name ?? ''} ${order.user_profiles?.last_name ?? ''}`.trim() || 'Unknown'
    },
    items: (order.order_items ?? []).map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      sku: item.sku,
      variantName: item.variant_name,
      quantity: item.quantity,
      price: parseFloat(item.price ?? 0),
      total: parseFloat(item.total ?? 0)
    })),
    transactions: (order.payment_transactions ?? []).map(txn => ({
      id: txn.id,
      amount: parseFloat(txn.amount ?? 0),
      status: txn.status,
      gateway: txn.gateway,
      gcashReferenceId: txn.gcash_reference_id ?? null,
      gcashNumber: txn.metadata?.gcash_number ?? null,
      createdAt: txn.created_at
    }))
  }));

  return (
    <AdminProtection>
      <div className="min-h-screen bg-background">
        <Sidebar userRole="admin" />
        <Header userRole="admin" userName="Admin" />
        <main className="pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <Breadcrumb />
            </div>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading orders...</div>}>
              <AdminOrdersInteractive initialOrders={initialOrders} />
            </Suspense>
          </div>
        </main>
      </div>
    </AdminProtection>
  );
}
