import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Process QRPH payment via PayMongo.
 *
 * Flow:
 *  1. Create a PayMongo PaymentIntent (server-side, secret key)
 *  2. Create a PayMongo PaymentMethod with type "qrph"
 *  3. Attach the PaymentMethod to the PaymentIntent
 *  4. Return the next_action.redirect.url so the client can display the QR code
 *  5. Client polls check-qrph-status to know when the payment completes
 */

const PAYMONGO_API = 'https://api.paymongo.com/v1';

async function paymongoFetch(path: string, options: RequestInit = {}) {
  const secretKey = Deno.env.get('PAYMONGO_SECRET_KEY');
  if (!secretKey) throw new Error('PAYMONGO_SECRET_KEY is not configured');

  const res = await fetch(`${PAYMONGO_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(secretKey + ':')}`,
      ...(options.headers || {}),
    },
  });

  const body = await res.json();
  if (!res.ok) {
    console.error('PayMongo API error:', JSON.stringify(body));
    const errMsg = body?.errors?.[0]?.detail || body?.errors?.[0]?.code || 'PayMongo API error';
    throw new Error(errMsg);
  }
  return body;
}

serve(async (req) => {
  console.log('QRPH payment function invoked');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderData, customerInfo } = await req.json();

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Stock pre-check ───────────────────────────────────────────────────────
    for (const rawItem of (orderData.items || [])) {
      const item = rawItem || {};
      const requestedQty = Math.max(1, parseInt(item.quantity || 1));

      if (item.variant_id) {
        const { data: variant, error: variantError } = await supabaseClient
          .from('product_variants')
          .select('id, stock_quantity')
          .eq('id', item.variant_id)
          .single();

        if (variantError || !variant || (parseInt(variant.stock_quantity ?? 0) || 0) < requestedQty) {
          return new Response(
            JSON.stringify({ error: 'Some items no longer have enough stock. Please update your cart.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (item.product_id || item.id) {
        const productId = item.product_id || item.id;
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .select('id, stock_quantity')
          .eq('id', productId)
          .single();

        if (productError || !product || (parseInt(product.stock_quantity ?? 0) || 0) < requestedQty) {
          return new Response(
            JSON.stringify({ error: 'Some items no longer have enough stock. Please update your cart.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // ── Amount in centavos (PayMongo expects integer centavos) ─────────────────
    const amountCentavos = Math.round(orderData.total * 100);
    if (amountCentavos < 100) {
      return new Response(
        JSON.stringify({ error: 'Minimum QRPH payment is ₱1.00' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Determine return URL ──────────────────────────────────────────────────
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^/]*$/, '') || 'http://localhost:3000';

    // ── Create / reuse order ──────────────────────────────────────────────────
    let order: any = null;
    const orderNumber = `VF-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`;

    if (orderData.orderId) {
      // Reuse existing order (e.g. user switched from card)
      const { data: updatedOrder, error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_method: 'qrph',
          payment_intent_id: null,          // clear Stripe PI
          status: 'pending',
          payment_status: 'pending',
        })
        .eq('id', orderData.orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update order for QRPH' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      order = updatedOrder;
    } else {
      // Duplicate guard
      const { data: recentOrder } = await supabaseClient
        .from('orders')
        .select('id, order_number')
        .eq('user_id', user.id)
        .eq('total_amount', orderData.total)
        .eq('payment_method', 'qrph')
        .gte('created_at', new Date(Date.now() - 60_000).toISOString())
        .limit(1)
        .maybeSingle();

      if (recentOrder) {
        // Return the existing order – client should re-poll for its status
        return new Response(
          JSON.stringify({
            success: true,
            orderId: recentOrder.id,
            orderNumber: recentOrder.order_number,
            status: 'awaiting_payment',
            message: 'QRPH order already created — scan the QR code to pay',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: newOrder, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          payment_method: 'qrph',
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax || 0,
          shipping_amount: orderData.shipping_cost || 0,
          discount_amount: orderData.discount || 0,
          total_amount: orderData.total,
          currency: orderData.currency || 'PHP',
          shipping_address: orderData.shipping || customerInfo.billing,
          billing_address: customerInfo.billing,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      order = newOrder;

      // Insert order items
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || item.id || null,
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || '',
        sku: item.sku || '',
        name: item.name,
        brand: item.brand || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      }));

      const { error: itemsError } = await supabaseClient.from('order_items').insert(orderItems);
      if (itemsError) {
        await supabaseClient.from('orders').delete().eq('id', order.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create order items' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ── PayMongo: Create PaymentIntent ────────────────────────────────────────
    const piResponse = await paymongoFetch('/payment_intents', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountCentavos,
            payment_method_allowed: ['qrph'],
            payment_method_options: {
              card: { request_three_d_secure: 'any' },
            },
            currency: 'PHP',
            capture_type: 'automatic',
            description: `VirtualFurnish Order ${order.order_number}`,
            metadata: {
              order_id: order.id,
              order_number: order.order_number,
            },
          },
        },
      }),
    });

    const paymongoPI = piResponse.data;
    const paymongoPaymentIntentId = paymongoPI.id;

    // ── PayMongo: Create PaymentMethod ────────────────────────────────────────
    const pmResponse = await paymongoFetch('/payment_methods', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            type: 'qrph',
            billing: {
              name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
              email: customerInfo.email,
              phone: customerInfo.phone || '',
            },
          },
        },
      }),
    });

    const paymongoPaymentMethodId = pmResponse.data.id;

    // ── PayMongo: Attach PaymentMethod to PaymentIntent ──────────────────────
    const attachResponse = await paymongoFetch(`/payment_intents/${paymongoPaymentIntentId}/attach`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymongoPaymentMethodId,
            return_url: `${origin}/checkout/success?order=${order.order_number}`,
          },
        },
      }),
    });

    const attachedPI = attachResponse.data;
    const nextAction = attachedPI.attributes?.next_action;

    // PayMongo QRPH returns QR as base64 image at next_action.code.image_url
    // Type is "consume_qr" for QRPH
    const qrImageUrl = nextAction?.code?.image_url || null;
    const qrCodeId = nextAction?.code?.id || null;
    const qrLabel = nextAction?.code?.label || null;
    // Fallback: some flows may use redirect URL instead
    const checkoutUrl = nextAction?.redirect?.url || nextAction?.url || null;

    console.log('PayMongo next_action type:', nextAction?.type);
    console.log('QR image_url present:', !!qrImageUrl);
    console.log('QR code ID:', qrCodeId);

    // ── Save PayMongo PI id on order ──────────────────────────────────────────
    await supabaseClient
      .from('orders')
      .update({ paymongo_payment_intent_id: paymongoPaymentIntentId })
      .eq('id', order.id);

    // ── Delete old payment_transactions if reusing order ──────────────────────
    if (orderData.orderId) {
      await supabaseClient.from('payment_transactions').delete().eq('order_id', order.id);
    }

    // ── Record pending payment transaction ────────────────────────────────────
    await supabaseClient.from('payment_transactions').insert({
      order_id: order.id,
      paymongo_payment_intent_id: paymongoPaymentIntentId,
      gateway_transaction_id: paymongoPaymentIntentId,
      amount: orderData.total,
      currency: 'PHP',
      status: 'pending',
      gateway: 'paymongo',
      metadata: {
        payment_method_type: 'qrph',
        paymongo_payment_method_id: paymongoPaymentMethodId,
        qr_code_id: qrCodeId,
        created_at: new Date().toISOString(),
      },
    });

    console.log('QRPH payment initiated:', {
      orderId: order.id,
      paymongoPaymentIntentId,
      qrCodeId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paymongoPaymentIntentId,
        qrImageUrl,       // base64 data:image/png;base64,... string
        qrCodeId,
        qrLabel,
        checkoutUrl,       // fallback redirect URL (may be null for QRPH)
        status: 'awaiting_payment',
        message: 'Scan the QR code to complete payment',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('QRPH payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
