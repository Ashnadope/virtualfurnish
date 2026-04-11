import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { orderData, customerInfo, paymentMethod = 'card' } = await req.json()

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!customerInfo?.firstName || !customerInfo?.lastName) {
      return new Response(
        JSON.stringify({ error: 'Customer name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!customerInfo?.billing?.address_line_1 || !customerInfo?.billing?.city) {
      return new Response(
        JSON.stringify({ error: 'Billing address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate stock on the server before creating payment records.
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

    const totalAmount = Math.round(orderData.total * 100)

    let stripeCustomer
    const customerData = {
      name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: {
        line1: customerInfo.billing?.address_line_1,
        line2: customerInfo.billing?.address_line_2,
        city: customerInfo.billing?.city,
        state: customerInfo.billing?.state,
        postal_code: customerInfo.billing?.postal_code,
        country: customerInfo.billing?.country || 'PH'
      },
      metadata: {
        supabase_user_id: user.id
      }
    }

    if (customerInfo.stripeCustomerId) {
      stripeCustomer = await stripe.customers.update(customerInfo.stripeCustomerId, customerData)
    } else {
      stripeCustomer = await stripe.customers.create(customerData)
      
      await supabaseClient
        .from('user_profiles')
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq('id', user.id)
    }

    let order: any
    let orderNumber: string

    // If an existing orderId is provided (e.g. "Continue to Payment"), reuse it
    if (orderData.orderId) {
      const { data: existing, error: fetchErr } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderData.orderId)
        .eq('user_id', user.id)
        .single()

      if (fetchErr || !existing) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      order = existing
      orderNumber = existing.order_number

      // Update payment method on the existing order
      await supabaseClient
        .from('orders')
        .update({ payment_method: paymentMethod })
        .eq('id', order.id)

      // Clean up any previous failed payment transactions for this order
      await supabaseClient
        .from('payment_transactions')
        .delete()
        .eq('order_id', order.id)
        .in('status', ['pending', 'failed'])
    } else {
      // Create a brand-new order
      orderNumber = `VF-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`

      const { data: newOrder, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          payment_method: paymentMethod,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax || 0,
          shipping_amount: orderData.shipping_cost || 0,
          discount_amount: orderData.discount || 0,
          total_amount: orderData.total,
          currency: orderData.currency || 'PHP',
          shipping_address: orderData.shipping || customerInfo.billing,
          billing_address: customerInfo.billing,
          status: 'pending',
          payment_status: 'pending'
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

      // Insert order items only for new orders
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

      await supabaseClient.from('order_items').insert(orderItems)
    }

    // Create PaymentIntent with order metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: orderData.currency || 'php',
      customer: stripeCustomer.id,
      description: `VirtualFurnish Order ${orderNumber}`,
      metadata: {
        order_number: orderNumber,
        order_id: order.id,
        user_id: user.id,
        customer_name: customerData.name,
        customer_email: customerInfo.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update the order with the payment intent id
    try {
      await supabaseClient.from('orders').update({ payment_intent_id: paymentIntent.id }).eq('id', order.id)
    } catch (e) {
      console.error('Failed updating order with payment_intent_id:', e)
    }

    await supabaseClient.from('payment_transactions').insert({
      order_id: order.id,
      payment_intent_id: paymentIntent.id,
      amount: orderData.total,
      currency: orderData.currency || 'PHP',
      status: 'pending',
      gateway: 'stripe',
      gateway_transaction_id: null
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
        orderNumber: orderNumber,
        amount: totalAmount,
        currency: paymentIntent.currency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})