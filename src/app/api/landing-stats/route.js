import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS for aggregate counts
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET() {
  try {
    const supabase = getServiceClient();

    const [
      { count: designCount },
      { count: customerCount },
      { count: productCount },
    ] = await Promise.all([
      supabase.from('room_designs').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      roomDesigns: designCount ?? 0,
      happyCustomers: customerCount ?? 0,
      furnitureItems: productCount ?? 0,
    });
  } catch (err) {
    console.error('[/api/landing-stats] Error:', err);
    return NextResponse.json({
      roomDesigns: 0,
      happyCustomers: 0,
      furnitureItems: 0,
    });
  }
}
