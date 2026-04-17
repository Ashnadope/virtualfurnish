import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const deriveStatusesFromPaymentIntent = (status) => {
  switch (status) {
    case 'succeeded':
      return { orderStatus: 'processing', paymentStatus: 'succeeded' };
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return { orderStatus: 'pending', paymentStatus: 'pending' };
    case 'canceled':
      return { orderStatus: 'cancelled', paymentStatus: 'cancelled' };
    default:
      return { orderStatus: 'pending', paymentStatus: 'pending' };
  }
};

export async function POST(req) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentIntentId = body?.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration missing (STRIPE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 502 }
      );
    }

    // 1. Retrieve Payment Intent from Stripe
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      }
    );

    const stripePayload = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok) {
      return NextResponse.json(
        { error: stripePayload?.error?.message || 'Failed to retrieve payment intent from Stripe' },
        { status: 502 }
      );
    }

    const { orderStatus, paymentStatus } = deriveStatusesFromPaymentIntent(stripePayload?.status);
    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);

    // 2. Look up the order
    const { data: order, error: orderLookupError } = await adminSupabase
      .from('orders')
      .select('id, order_number, user_id, stock_allocated')
      .eq('payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)
      .single();

    if (orderLookupError || !order) {
      return NextResponse.json(
        { error: 'Order not found for this payment' },
        { status: 404 }
      );
    }

    // 3. Update order status
    const { error: orderUpdateError } = await adminSupabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (orderUpdateError) {
      return NextResponse.json(
        { error: orderUpdateError.message || 'Failed to update order' },
        { status: 502 }
      );
    }

    // 4. Deduct stock atomically when payment succeeded
    let stockDeductionResult = null;
    if (orderStatus === 'processing' && !order.stock_allocated) {
      console.log('[confirm-payment] Attempting stock deduction for order:', order.id);

      // Verify order_items exist
      const { data: items, error: itemsErr } = await adminSupabase
        .from('order_items')
        .select('id, product_id, variant_id, quantity')
        .eq('order_id', order.id);

      console.log('[confirm-payment] order_items for', order.id, ':', JSON.stringify(items), 'error:', itemsErr?.message);

      const { error: stockError } = await adminSupabase.rpc('deduct_order_stock_atomic', {
        p_order_id: order.id,
      });

      if (stockError) {
        console.error('[confirm-payment] Stock deduction FAILED for order', order.id, ':', stockError.message);
        stockDeductionResult = { success: false, error: stockError.message };
        // Don't block — payment already succeeded, stock issue can be handled manually
      } else {
        console.log('[confirm-payment] Stock deduction SUCCESS for order', order.id);
        await adminSupabase
          .from('orders')
          .update({ stock_allocated: true })
          .eq('id', order.id);
        stockDeductionResult = { success: true };
      }
    } else {
      console.log('[confirm-payment] Skipping stock deduction. orderStatus:', orderStatus, 'stock_allocated:', order.stock_allocated);
    }

    // 5. Update payment transaction record
    await adminSupabase
      .from('payment_transactions')
      .update({
        status: stripePayload?.status || paymentStatus,
        stripe_charge_id: stripePayload?.latest_charge || null,
        metadata: {
          stripe_payment_intent_id: stripePayload?.id,
          confirmed_at: new Date().toISOString(),
        },
      })
      .eq('payment_intent_id', paymentIntentId);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: orderStatus,
        payment_status: paymentStatus,
      },
      payment_intent: {
        id: stripePayload?.id,
        status: stripePayload?.status,
      },
      stockDeduction: stockDeductionResult,
    });
  } catch (err) {
    console.error('/api/checkout/confirm-payment error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
