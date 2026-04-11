import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelOrder as jtCancelOrder } from '@/lib/jtexpress';

/**
 * POST /api/shipping/cancel
 *
 * Cancel a J&T Express shipment for an order.
 *
 * Body: { orderId: string }
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, jt_waybill, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.jt_waybill) {
      return NextResponse.json({
        message: 'No J&T shipment to cancel',
      });
    }

    // Cancel with J&T
    const jtResult = await jtCancelOrder(order.order_number);

    // Clear waybill from order
    await supabase
      .from('orders')
      .update({
        jt_waybill: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      jtResponse: jtResult.data,
    });
  } catch (err) {
    console.error('J&T cancel error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to cancel J&T shipment' },
      { status: 500 }
    );
  }
}
