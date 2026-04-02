import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('GCash payment function invoked')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const sendOutOfStockSupportNotice = async (orderId: string) => {
      try {
        const { data: order } = await supabaseClient
          .from('orders')
          .select('id, user_id, order_number')
          .eq('id', orderId)
          .single();

        if (!order?.user_id) return;

        const { data: adminProfile } = await supabaseClient
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle();

        const { data: existingNotice } = await supabaseClient
          .from('support_messages')
          .select('id')
          .eq('user_id', order.user_id)
          .eq('order_id', order.id)
          .eq('sender_role', 'admin')
          .limit(1)
          .maybeSingle();

        if (existingNotice?.id) return;

        await supabaseClient.from('support_messages').insert({
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

    console.log('Authenticating user...')
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      console.error('Unauthorized: No user found')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)
    console.log('Parsing request body...')
    const { orderData, customerInfo } = await req.json()
    console.log('Request data:', { orderData, customerInfo })

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!orderData.gcash_number) {
      return new Response(
        JSON.stringify({ error: 'GCash number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pre-check stock before creating/updating payment records.
    for (const rawItem of (orderData.items || [])) {
      const item = rawItem || {};
      const requestedQty = Math.max(1, parseInt(item.quantity || 1));

      if (item.variant_id) {
        const { data: variant, error: variantError } = await supabaseClient
          .from('product_variants')
          .select('id, stock_quantity')
          .eq('id', item.variant_id)
          .single();

        if (variantError || !variant) {
          return new Response(
            JSON.stringify({ error: 'One or more items are no longer available.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if ((parseInt(variant.stock_quantity ?? 0) || 0) < requestedQty) {
          return new Response(
            JSON.stringify({ error: 'Some items no longer have enough stock. Please update your cart.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else if (item.product_id || item.id) {
        const productId = item.product_id || item.id;
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .select('id, stock_quantity')
          .eq('id', productId)
          .single();

        if (productError || !product) {
          return new Response(
            JSON.stringify({ error: 'One or more items are no longer available.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if ((parseInt(product.stock_quantity ?? 0) || 0) < requestedQty) {
          return new Response(
            JSON.stringify({ error: 'Some items no longer have enough stock. Please update your cart.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    const orderNumber = `VF-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`
    const gcashReferenceId = `GC-${Date.now()}-${Math.random().toString().substr(2, 6)}`

    console.log('Creating order with number:', orderNumber)
    console.log('GCash reference ID:', gcashReferenceId)
    console.log('Existing orderId from client:', orderData.orderId || 'none')

    // In production, integrate with actual GCash API
    // For now, simulate GCash payment processing
    const gcashPaymentResult = {
      success: true,
      reference_id: gcashReferenceId,
      transaction_id: `TXN-${Date.now()}`,
      status: 'succeeded'
    }

    let order: any = null

    // If the client already has an order (e.g. card payment was initialized first),
    // UPDATE that order to GCash instead of creating a duplicate.
    if (orderData.orderId) {
      console.log('Updating existing order to GCash:', orderData.orderId)
      const { data: updatedOrder, error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_method: 'gcash',
          payment_intent_id: gcashReferenceId,
          status: 'processing',
          payment_status: 'succeeded'
        })
        .eq('id', orderData.orderId)
        .eq('user_id', user.id)   // extra safety: only the owner can update
        .select()
        .single()

      if (updateError) {
        console.error('Order update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update order for GCash' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      order = updatedOrder
      console.log('Order updated successfully:', order.id)
    } else {
      // No existing order — check for a very recent duplicate then create fresh
      const { data: recentOrder } = await supabaseClient
        .from('orders')
        .select('id, order_number')
        .eq('user_id', user.id)
        .eq('total_amount', orderData.total)
        .eq('payment_method', 'gcash')
        .gte('created_at', new Date(Date.now() - 60_000).toISOString())
        .limit(1)
        .maybeSingle()

      if (recentOrder) {
        console.log('Duplicate order detected, returning existing order:', recentOrder.id)
        const { data: existingTxn } = await supabaseClient
          .from('payment_transactions')
          .select('gcash_reference_id')
          .eq('order_id', recentOrder.id)
          .maybeSingle()
        return new Response(
          JSON.stringify({
            success: true,
            orderId: recentOrder.id,
            orderNumber: recentOrder.order_number,
            referenceNumber: existingTxn?.gcash_reference_id || gcashReferenceId,
            status: 'succeeded',
            message: 'GCash payment already processed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Creating new order in database...')
      const { data: newOrder, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          payment_method: 'gcash',
          payment_intent_id: gcashReferenceId,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax || 0,
          shipping_amount: orderData.shipping_cost || 0,
          discount_amount: orderData.discount || 0,
          total_amount: orderData.total,
          currency: orderData.currency || 'PHP',
          shipping_address: orderData.shipping || customerInfo.billing,
          billing_address: customerInfo.billing,
          status: gcashPaymentResult.success ? 'processing' : 'pending',
          payment_status: gcashPaymentResult.success ? 'succeeded' : 'pending'
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      order = newOrder
      console.log('Order created successfully:', order.id)
    }

    // Only insert order_items for freshly created orders (reused orders already have items)
    if (!orderData.orderId) {
      console.log('Inserting order items...')
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
        total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
      }))

      const { error: itemsError } = await supabaseClient.from('order_items').insert(orderItems)
      if (itemsError) {
        console.error('Order items insert error:', itemsError)
        // Roll back the order if items fail
        await supabaseClient.from('orders').delete().eq('id', order.id)
        return new Response(
          JSON.stringify({ error: 'Failed to create order items' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('Order items inserted')
    } else {
      console.log('Skipping order_items insert — reusing existing order:', order.id)
    }

    console.log('Creating payment transaction...')
    const txnId = `TXN-${Date.now()}-${Math.random().toString().substr(2, 6)}`

    // For reused orders, delete the old card payment_transaction first (upsert not possible without unique key)
    if (orderData.orderId) {
      await supabaseClient.from('payment_transactions').delete().eq('order_id', order.id)
    }

    const { error: txnError } = await supabaseClient.from('payment_transactions').insert({
      order_id: order.id,
      gcash_reference_id: gcashReferenceId,
      gateway_transaction_id: txnId,
      amount: orderData.total,
      currency: orderData.currency || 'PHP',
      status: gcashPaymentResult.status,
      gateway: 'gcash',
      metadata: {
        gcash_number: orderData.gcash_number,
        reference_id: gcashReferenceId,
        processed_at: new Date().toISOString()
      }
    })

    if (txnError) {
      console.error('Payment transaction insert error (non-fatal):', txnError)
      // Non-fatal: order was created, just log and continue
    }

    console.log('Payment transaction created')

    // Atomically decrement stock for the whole order.
    const { error: stockError } = await supabaseClient.rpc('deduct_order_stock_atomic', {
      p_order_id: order.id,
    });

    if (stockError) {
      const msg = String(stockError?.message || '');
      const isInsufficient = msg.includes('INSUFFICIENT_STOCK');
      console.error('Stock decrement error for order', order.id, ':', stockError?.message);

      if (isInsufficient) {
        await supabaseClient
          .from('orders')
          .update({
            status: 'processing',
            payment_status: 'succeeded',
            stock_allocated: false,
            notes: 'Stock unavailable after GCash payment confirmation. Customer was asked via support to cancel the order for refund processing.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        await sendOutOfStockSupportNotice(order.id);

        return new Response(
          JSON.stringify({
            success: false,
            orderId: order.id,
            orderNumber: order.order_number,
            referenceNumber: gcashReferenceId,
            status: 'action_required',
            message: 'Payment was received, but stock became unavailable. Check support for cancellation and refund instructions.'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      await supabaseClient
        .from('orders')
        .update({ stock_allocated: true, updated_at: new Date().toISOString() })
        .eq('id', order.id);
      console.log('Stock decremented atomically for order', order.id);
    }

    console.log('GCash payment processed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        referenceNumber: gcashReferenceId,
        status: gcashPaymentResult.status,
        message: 'GCash payment processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('GCash payment error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})