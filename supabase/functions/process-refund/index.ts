import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, payment_status, payment_method')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If already refunded / refund pending, skip silently
    if (['refunded', 'refund_pending'].includes(order.payment_status)) {
      return new Response(JSON.stringify({
        success: true,
        refundStatus: order.payment_status,
        message: 'Refund already processed.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch the payment transaction for this order
    const { data: txn, error: txnErr } = await supabase
      .from('payment_transactions')
      .select('id, gateway, gateway_transaction_id, payment_intent_id, stripe_charge_id, gcash_reference_id, paymongo_payment_intent_id, amount, status, metadata')
      .eq('order_id', orderId)
      .eq('transaction_type', 'payment')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (txnErr || !txn) {
      return new Response(JSON.stringify({ error: 'Payment transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let refundStatus: 'refunded' | 'refund_pending' = 'refund_pending';
    let refundMeta: Record<string, unknown> = {};

    // ── Stripe refund ──────────────────────────────────────────────────────────
    if (txn.gateway === 'stripe' && txn.status === 'succeeded') {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2024-11-20.acacia',
      });

      // Prefer stripe_charge_id; fall back to payment_intent (Stripe accepts both)
      const refundSource = txn.stripe_charge_id || txn.payment_intent_id;

      const refund = await stripe.refunds.create(
        txn.stripe_charge_id
          ? { charge: txn.stripe_charge_id }
          : { payment_intent: txn.payment_intent_id }
      );

      refundStatus = refund.status === 'succeeded' ? 'refunded' : 'refund_pending';
      refundMeta = {
        stripe_refund_id: refund.id,
        stripe_refund_status: refund.status,
        refund_source: refundSource,
        processed_at: new Date().toISOString(),
      };

    // ── GCash — simulated; flag for manual processing ─────────────────────────
    } else if (txn.gateway === 'gcash') {
      refundStatus = 'refund_pending';
      refundMeta = {
        gcash_reference_id: txn.gcash_reference_id,
        note: 'Manual GCash refund required. Reference ID provided.',
        processed_at: new Date().toISOString(),
      };

    // ── PayMongo (QRPH) — create refund via PayMongo API ────────────────────
    } else if (txn.gateway === 'paymongo') {
      const paymongoSecretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
      if (!paymongoSecretKey) {
        return new Response(JSON.stringify({ error: 'PayMongo secret key not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find the PayMongo payment ID from the transaction
      const paymongoPaymentId = txn.gateway_transaction_id || txn.metadata?.paymongo_payment_id;

      if (paymongoPaymentId) {
        try {
          const refundRes = await fetch('https://api.paymongo.com/v1/refunds', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Basic ${btoa(paymongoSecretKey + ':')}`,
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  amount: Math.round(txn.amount * 100), // centavos
                  payment_id: paymongoPaymentId,
                  reason: 'requested_by_customer',
                },
              },
            }),
          });

          const refundBody = await refundRes.json();

          if (refundRes.ok) {
            refundStatus = refundBody.data?.attributes?.status === 'succeeded' ? 'refunded' : 'refund_pending';
            refundMeta = {
              paymongo_refund_id: refundBody.data?.id,
              paymongo_refund_status: refundBody.data?.attributes?.status,
              processed_at: new Date().toISOString(),
            };
          } else {
            console.error('PayMongo refund API error:', JSON.stringify(refundBody));
            refundStatus = 'refund_pending';
            refundMeta = {
              note: 'PayMongo refund API failed. Manual refund may be required.',
              api_error: refundBody?.errors?.[0]?.detail || 'Unknown error',
              processed_at: new Date().toISOString(),
            };
          }
        } catch (pmErr: any) {
          console.error('PayMongo refund request failed:', pmErr);
          refundStatus = 'refund_pending';
          refundMeta = {
            note: 'PayMongo refund request failed. Manual refund required.',
            error: pmErr.message,
            processed_at: new Date().toISOString(),
          };
        }
      } else {
        refundStatus = 'refund_pending';
        refundMeta = {
          note: 'No PayMongo payment ID found. Manual refund required.',
          processed_at: new Date().toISOString(),
        };
      }
    }

    // Record refund transaction row
    await supabase.from('payment_transactions').insert({
      order_id: orderId,
      payment_intent_id: txn.payment_intent_id,
      gcash_reference_id: txn.gcash_reference_id,
      amount: txn.amount,
      currency: 'PHP',
      status: refundStatus === 'refunded' ? 'succeeded' : 'pending',
      transaction_type: 'refund',
      gateway: txn.gateway,
      gateway_transaction_id: (refundMeta.stripe_refund_id ?? refundMeta.paymongo_refund_id ?? null) as string,
      metadata: refundMeta,
    });

    // Update order payment_status
    await supabase
      .from('orders')
      .update({ payment_status: refundStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return new Response(JSON.stringify({
      success: true,
      refundStatus,
      gateway: txn.gateway,
      message: txn.gateway === 'gcash'
        ? 'GCash refund flagged for manual processing.'
        : txn.gateway === 'paymongo'
        ? (refundStatus === 'refunded' ? 'PayMongo refund issued successfully.' : 'PayMongo refund is pending.')
        : 'Stripe refund issued successfully.',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Process refund error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
