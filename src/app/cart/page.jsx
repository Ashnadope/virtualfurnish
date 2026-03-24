import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import CartInteractive from './components/CartInteractive';
import CartProtection from './components/CartProtection';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shopping Cart - VirtualFurnish',
  description: 'Review your selected furniture items and proceed to checkout at Brosas Furniture Store.'
};

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialItems = [];
  if (user) {
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        price,
        created_at,
        product_id,
        variant_id,
        products (
          id,
          name,
          description,
          image_url,
          brand,
          category,
          base_price
        ),
        product_variants (
          id,
          name,
          color,
          price,
          stock_quantity,
          sku,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    initialItems = data ?? [];
  }

  return (
    <CartProtection>
      <div className="min-h-screen bg-background">
        <Sidebar userRole="customer" />
        <Header userRole="customer" />
        <main className="pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <Breadcrumb />
            </div>

            <CartInteractive initialItems={initialItems} />
          </div>
        </main>
      </div>
    </CartProtection>
  );
}