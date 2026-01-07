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

    const totalAmount = Math.round(orderData.total * 100)
    const orderNumber = `VF-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`

    let stripeCustomer
    const customerData = {
      name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: {
        line1: customerInfo.billing.address_line_1,
        line2: customerInfo.billing.address_line_2,
        city: customerInfo.billing.city,
        state: customerInfo.billing.state,
        postal_code: customerInfo.billing.postal_code,
        country: customerInfo.billing.country || 'PH'
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: orderData.currency || 'php',
      customer: stripeCustomer.id,
      description: `VirtualFurnish Order ${orderNumber}`,
      metadata: {
        order_number: orderNumber,
        user_id: user.id,
        customer_name: customerData.name,
        customer_email: customerInfo.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        payment_intent_id: paymentIntent.id,
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

    await supabaseClient.from('payment_transactions').insert({
      order_id: order.id,
      payment_intent_id: paymentIntent.id,
      amount: orderData.total,
      currency: orderData.currency || 'PHP',
      status: 'pending',
      gateway: 'stripe'
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