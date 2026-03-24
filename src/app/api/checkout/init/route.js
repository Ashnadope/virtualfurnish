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

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      cartData: cartResult.data ?? [],
      profile: profileResult.data ?? null,
    });
  } catch (err) {
    console.error('/api/checkout/init error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to initialize checkout' }, { status: 500 });
  }
}
