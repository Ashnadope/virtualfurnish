import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [cartResult, profileResult] = await Promise.all([
      supabase
        .from('cart_items')
        .select('*, products(*), product_variants(*)')
        .eq('user_id', user.id),
      supabase
        .from('user_profiles')
        .select('*, addresses(*)')
        .eq('id', user.id)
        .single(),
    ]);

    if (cartResult.error) throw cartResult.error;
    if (profileResult.error) throw profileResult.error;

    const cartData = cartResult.data ?? [];
    const insufficientItems = cartData
      .map((item) => {
        const requested = parseInt(item?.quantity ?? 0, 10) || 0;
        const available = item?.variant_id
          ? (parseInt(item?.product_variants?.stock_quantity ?? 0, 10) || 0)
          : (parseInt(item?.products?.stock_quantity ?? 0, 10) || 0);

        if (requested > available) {
          return {
            cartItemId: item?.id,
            productId: item?.product_id,
            variantId: item?.variant_id,
            name: item?.products?.name || 'Item',
            requested,
            available,
          };
        }

        return null;
      })
      .filter(Boolean);

    if (insufficientItems.length > 0) {
      return NextResponse.json(
        {
          code: 'INSUFFICIENT_STOCK',
          error: 'Some cart items are no longer available in the selected quantity. Please review your cart.',
          items: insufficientItems,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      cartData,
      profile: profileResult.data ?? null,
    });
  } catch (err) {
    console.error('/api/checkout/init error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to initialize checkout' }, { status: 500 });
  }
}
