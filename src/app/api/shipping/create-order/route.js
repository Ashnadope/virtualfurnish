import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrder } from '@/lib/jtexpress';
import { STORE_ADDRESS } from '@/services/shipping.service';

/**
 * POST /api/shipping/create-order
 *
 * Create a J&T Express shipment for a paid order.
 * Called by admin or automatically after payment confirmation.
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

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, products(weight))')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.payment_status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Order payment has not been confirmed' },
        { status: 400 }
      );
    }

    // Already shipped?
    if (order.jt_waybill) {
      return NextResponse.json({
        message: 'Shipment already created',
        waybill: order.jt_waybill,
      });
    }

    const shipping = order.shipping_address || {};

    // Calculate total weight from items
    const totalWeight = (order.order_items || []).reduce((sum, item) => {
      const w = parseFloat(String(item.products?.weight || '5').replace(/[^0-9.]/g, ''));
      return sum + (isNaN(w) ? 5 : w) * item.quantity;
    }, 0);

    const jtResult = await createOrder({
      orderNumber: order.order_number,
      serviceType: 'EZ',
      weight: Math.max(1, Math.ceil(totalWeight)),
      itemCount: order.order_items?.length || 1,
      goodsDescription: `VirtualFurnish Order ${order.order_number}`,
      declaredValue: order.total_amount,
      sender: STORE_ADDRESS,
      receiver: {
        name: `${shipping.first_name || ''} ${shipping.last_name || ''}`.trim() || 'Customer',
        phone: shipping.phone || '',
        address: `${shipping.address_line_1 || ''} ${shipping.address_line_2 || ''}`.trim(),
        city: shipping.city || '',
        province: shipping.state || '',
        postalCode: shipping.postal_code || '',
      },
    });

    // Extract waybill from J&T response
    const waybill =
      jtResult?.data?.billCode ||
      jtResult?.data?.txlogisticId ||
      jtResult?.data?.waybillNo ||
      null;

    // Save waybill to order
    if (waybill) {
      await supabase
        .from('orders')
        .update({
          jt_waybill: waybill,
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      waybill,
      jtResponse: jtResult.data,
    });
  } catch (err) {
    console.error('J&T create order error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create J&T shipment' },
      { status: 500 }
    );
  }
}
