import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTracking } from '@/lib/jtexpress';

/**
 * GET /api/shipping/track?orderId=xxx
 *
 * Fetch real-time tracking info from J&T Express for an order.
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId query param is required' },
        { status: 400 }
      );
    }

    // Fetch order — make sure user owns it
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, jt_waybill, status, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization: user must own the order (or be admin — simplified here)
    if (order.user_id !== user.id) {
      // Check if admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (!order.jt_waybill) {
      return NextResponse.json({
        status: order.status,
        message: 'Shipment has not been created with J&T yet',
        events: [],
      });
    }

    const trackingResult = await getTracking(order.jt_waybill);

    return NextResponse.json({
      waybill: order.jt_waybill,
      orderNumber: order.order_number,
      status: order.status,
      tracking: trackingResult.data,
    });
  } catch (err) {
    console.error('Tracking query error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch tracking info' },
      { status: 500 }
    );
  }
}
