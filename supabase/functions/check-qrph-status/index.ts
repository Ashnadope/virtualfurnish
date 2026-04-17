import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYMONGO_API = 'https://api.paymongo.com/v1';

/**
 * Poll the PayMongo PaymentIntent status for a QRPH payment.
 * If the PI has moved to "succeeded", update the local order + transaction
 * and deduct stock atomically.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order
    const { data: order, error: orderErr } = await supabaseClient
      .from('orders')
      .select('id, order_number, user_id, paymongo_payment_intent_id, payment_status, total_amount, stock_allocated')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Already succeeded — return immediately
    if (order.payment_status === 'succeeded') {
      return new Response(
        JSON.stringify({
          status: 'succeeded',
          orderId: order.id,
          orderNumber: order.order_number,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymongoPI_Id = order.paymongo_payment_intent_id;
    if (!paymongoPI_Id) {
      return new Response(
        JSON.stringify({ error: 'No PayMongo payment intent for this order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Fetch PayMongo PaymentIntent status ─────────────────────────────────
    const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
    if (!secretKey) throw new Error('PAYMONGO_SECRET_KEY not configured');

    const piRes = await fetch(`${PAYMONGO_API}/payment_intents/${paymongoPI_Id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(secretKey + ':')}`,
      },
    });
    const piBody = await piRes.json();

    if (!piRes.ok) {
      console.error('PayMongo retrieve PI error:', JSON.stringify(piBody));
      return new Response(
        JSON.stringify({ error: 'Failed to check payment status' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const piStatus = piBody.data?.attributes?.status; // awaiting_next_action | awaiting_payment_method | processing | succeeded | failed
    const paymongoPayments = piBody.data?.attributes?.payments || [];

    // Map PayMongo status → our status
    let mappedStatus: string;
    switch (piStatus) {
      case 'succeeded':
        mappedStatus = 'succeeded';
        break;
      case 'processing':
        mappedStatus = 'processing';
        break;
      case 'awaiting_next_action':
      case 'awaiting_payment_method':
        mappedStatus = 'awaiting_payment';
        break;
      default:
        mappedStatus = piStatus || 'unknown';
    }

    // ── If succeeded, update order + deduct stock ───────────────────────────
    if (mappedStatus === 'succeeded' && order.payment_status !== 'succeeded') {
      const paymentId = paymongoPayments[0]?.id || null;

      await supabaseClient
        .from('orders')
        .update({
          status: 'processing',
          payment_status: 'succeeded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Guard: skip stock deduction if already allocated (idempotency)
      if (order.stock_allocated) {
        console.log('Stock already allocated for order', order.id, '— skipping deduction');
        return new Response(
          JSON.stringify({
            status: mappedStatus,
            orderId: order.id,
            orderNumber: order.order_number,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update payment_transaction
      await supabaseClient
        .from('payment_transactions')
        .update({
          status: 'succeeded',
          gateway_transaction_id: paymentId || paymongoPI_Id,
          metadata: {
            payment_method_type: 'qrph',
            paymongo_payment_id: paymentId,
            confirmed_at: new Date().toISOString(),
          },
        })
        .eq('order_id', order.id)
        .eq('gateway', 'paymongo');

      // Atomically deduct stock
      const { error: stockError } = await supabaseClient.rpc('deduct_order_stock_atomic', {
        p_order_id: order.id,
      });

      if (stockError) {
        const msg = String(stockError?.message || '');
        if (msg.includes('INSUFFICIENT_STOCK')) {
          await supabaseClient
            .from('orders')
            .update({
              stock_allocated: false,
              notes: 'Stock unavailable after QRPH payment. Customer notified via support.',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);
        }
        console.error('Stock deduction error:', stockError.message);
      } else {
        await supabaseClient
          .from('orders')
          .update({ stock_allocated: true, updated_at: new Date().toISOString() })
          .eq('id', order.id);
      }
    }

    return new Response(
      JSON.stringify({
        status: mappedStatus,
        orderId: order.id,
        orderNumber: order.order_number,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('check-qrph-status error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
