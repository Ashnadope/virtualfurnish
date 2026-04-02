import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables");
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-12-15",
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const sendOutOfStockSupportNotice = async (orderId: string) => {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('id, user_id, order_number')
        .eq('id', orderId)
        .single();

      if (!order?.user_id) return;

      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      const { data: existingNotice } = await supabase
        .from('support_messages')
        .select('id')
        .eq('user_id', order.user_id)
        .eq('order_id', order.id)
        .eq('sender_role', 'admin')
        .limit(1)
        .maybeSingle();

      if (existingNotice?.id) return;

      await supabase.from('support_messages').insert({
        user_id: order.user_id,
        sender_id: adminProfile?.id || order.user_id,
        sender_role: 'admin',
        message: 'One or more furniture items in this paid order became unavailable before fulfillment. Please open this order and cancel it so we can process your refund.',
        order_id: order.id,
        order_number: order.order_number,
        is_read_by_customer: false,
        is_read_by_admin: true,
      });
    } catch (noticeError) {
      console.error('Failed to send out-of-stock support notice:', noticeError);
    }
  };

  // Helper: find order by payment_intent id or order_number in metadata
  const findOrder = async (piId?: string | null, orderNumber?: string | null) => {
    try {
      if (piId) {
        const { data } = await supabase.from('orders').select('id').eq('payment_intent_id', piId).limit(1).maybeSingle();
        if (data?.id) return data.id;
      }
      if (orderNumber) {
        const { data } = await supabase.from('orders').select('id').eq('order_number', orderNumber).limit(1).maybeSingle();
        if (data?.id) return data.id;
      }
    } catch (err) {
      console.error('findOrder error:', err);
    }
    return null;
  };

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();

    let event: any;

  try {
      // In edge/deno environments Stripe requires the async verifier
      event = await (stripe.webhooks as any).constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
      console.error("Stripe signature verification failed:", err?.message);
    return new Response("Invalid signature", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Debug logs: surface event id/type and signature in Supabase logs
  try {
    console.log('Received Stripe event:', event?.id, event?.type);
    console.log('Stripe signature header present:', !!signature);
  } catch (e) {
    console.error('Debug log error:', e);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        const orderId = await findOrder(
          pi.id,
          pi.metadata?.order_number ?? pi.metadata?.orderNumber ?? pi.metadata?.orderId ?? pi.metadata?.order_id ?? null
        );

        try {
          const gatewayId = pi.latest_charge ?? pi.id;
          const { data: upsertData, error: upsertError } = await supabase.from('payment_transactions').upsert({
            order_id: orderId,
            payment_intent_id: pi.id,
            stripe_charge_id: pi.latest_charge ?? null,
            gateway_transaction_id: gatewayId,
            amount: (pi.amount_received ?? pi.amount ?? 0) / 100,
            currency: (pi.currency ?? 'PHP').toUpperCase(),
            status: 'succeeded',
            gateway: 'stripe',
            transaction_type: 'payment',
            metadata: event,
          }, { onConflict: 'gateway_transaction_id' });
          console.log('payment_transactions upsert result:', { upsertError, upsertRowCount: Array.isArray(upsertData) ? upsertData.length : (upsertData ? 1 : 0) });

          if (upsertError && upsertError.code === '42P10') {
            // Fallback for DBs that don't expose a matching unique constraint for ON CONFLICT
            try {
              const { data: existing } = await supabase.from('payment_transactions').select('id').eq('gateway_transaction_id', gatewayId).limit(1).maybeSingle();
              if (!existing) {
                const { data: insertData, error: insertError } = await supabase.from('payment_transactions').insert({
                  order_id: orderId,
                  payment_intent_id: pi.id,
                  stripe_charge_id: pi.latest_charge ?? null,
                  gateway_transaction_id: gatewayId,
                  amount: (pi.amount_received ?? pi.amount ?? 0) / 100,
                  currency: (pi.currency ?? 'PHP').toUpperCase(),
                  status: 'succeeded',
                  gateway: 'stripe',
                  transaction_type: 'payment',
                  metadata: event,
                });
                console.log('payment_transactions fallback insert result:', { insertError, insertRowCount: Array.isArray(insertData) ? insertData.length : (insertData ? 1 : 0) });
              } else {
                console.log('payment_transactions exists (fallback), skipping insert for', gatewayId);
              }
            } catch (e) {
              console.error('Fallback insert failed (pi):', e);
            }
          }
        } catch (err) {
          console.error('Failed upserting payment_transactions (pi):', err);
        }

        if (orderId) {
          try {
            const { data: orderData, error: orderError } = await supabase.from('orders').update({ payment_status: 'succeeded', status: 'processing', updated_at: new Date().toISOString() }).eq('id', orderId);
            console.log('orders.update result (pi):', { orderError, orderRowCount: Array.isArray(orderData) ? orderData.length : (orderData ? 1 : 0) });
          } catch (err) {
            console.error('Failed updating order (pi):', err);
          }

          // Atomically decrement stock for the whole order.
          // If stock is insufficient, mark order for refund workflow.
          try {
            const { error: stockError } = await supabase.rpc('deduct_order_stock_atomic', {
              p_order_id: orderId,
            });

            if (stockError) {
              const msg = String(stockError?.message || '');
              const isInsufficient = msg.includes('INSUFFICIENT_STOCK');

              console.error('Stock decrement error for order', orderId, ':', stockError);

              if (isInsufficient) {
                await supabase
                  .from('orders')
                  .update({
                    status: 'processing',
                    payment_status: 'succeeded',
                    stock_allocated: false,
                    notes: 'Stock unavailable after payment confirmation. Customer was asked via support to cancel the order for refund processing.',
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', orderId);
                await sendOutOfStockSupportNotice(orderId);
                console.warn('Order kept cancellable and customer notified via support due to insufficient stock:', orderId);
              }
            } else {
              await supabase
                .from('orders')
                .update({ stock_allocated: true, updated_at: new Date().toISOString() })
                .eq('id', orderId);
              console.log('Stock decremented atomically for order', orderId);
            }
          } catch (err) {
            // Non-fatal — payment is confirmed, stock update failure should not fail the webhook.
            console.error('Unexpected stock decrement error for order', orderId, ':', err);
          }
        }
        break;
      }

      case 'charge.succeeded': {
        const ch = event.data.object as any;
        const piId = ch.payment_intent ?? null;
        const orderId = await findOrder(
          piId,
          ch.metadata?.order_number ?? ch.metadata?.orderNumber ?? ch.metadata?.orderId ?? ch.metadata?.order_id ?? null
        );

        try {
          const gatewayId = ch.id;
          const { data: upsertData, error: upsertError } = await supabase.from('payment_transactions').upsert({
            order_id: orderId,
            payment_intent_id: piId,
            stripe_charge_id: ch.id,
            gateway_transaction_id: gatewayId,
            amount: (ch.amount ?? 0) / 100,
            currency: (ch.currency ?? 'PHP').toUpperCase(),
            status: 'succeeded',
            gateway: 'stripe',
            transaction_type: 'payment',
            metadata: event,
          }, { onConflict: 'gateway_transaction_id' });
          console.log('payment_transactions upsert result (ch):', { upsertError, upsertRowCount: Array.isArray(upsertData) ? upsertData.length : (upsertData ? 1 : 0) });

          if (upsertError && upsertError.code === '42P10') {
            // Fallback for DBs that don't expose a matching unique constraint for ON CONFLICT
            try {
              const { data: existing } = await supabase.from('payment_transactions').select('id').eq('gateway_transaction_id', gatewayId).limit(1).maybeSingle();
              if (!existing) {
                const { data: insertData, error: insertError } = await supabase.from('payment_transactions').insert({
                  order_id: orderId,
                  payment_intent_id: piId,
                  stripe_charge_id: ch.id,
                  gateway_transaction_id: gatewayId,
                  amount: (ch.amount ?? 0) / 100,
                  currency: (ch.currency ?? 'PHP').toUpperCase(),
                  status: 'succeeded',
                  gateway: 'stripe',
                  transaction_type: 'payment',
                  metadata: event,
                });
                console.log('payment_transactions fallback insert result (ch):', { insertError, insertRowCount: Array.isArray(insertData) ? insertData.length : (insertData ? 1 : 0) });
              } else {
                console.log('payment_transactions exists (fallback), skipping insert for', gatewayId);
              }
            } catch (e) {
              console.error('Fallback insert failed (ch):', e);
            }
          }
        } catch (err) {
          console.error('Failed upserting payment_transactions (ch):', err);
        }

        if (orderId) {
          try {
            const { data: orderData, error: orderError } = await supabase.from('orders').update({ payment_status: 'succeeded', status: 'processing', updated_at: new Date().toISOString() }).eq('id', orderId);
            console.log('orders.update result (ch):', { orderError, orderRowCount: Array.isArray(orderData) ? orderData.length : (orderData ? 1 : 0) });
          } catch (err) {
            console.error('Failed updating order (ch):', err);
          }
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Example Supabase write
        await supabase.from("stripe_events").insert({
          event_id: event.id,
          type: event.type,
          session_id: session.id,
          customer_id: session.customer,
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // handle subscription changes here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler failed", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response("ok", {
    status: 200,
    headers: corsHeaders,
  });
});
