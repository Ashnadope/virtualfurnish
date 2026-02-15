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

    const orderNumber = `VF-${new Date().getFullYear()}-${Math.random().toString().substr(2, 8)}`
    const gcashReferenceId = `GC-${Date.now()}-${Math.random().toString().substr(2, 6)}`

    console.log('Creating order with number:', orderNumber)
    console.log('GCash reference ID:', gcashReferenceId)

    // In production, integrate with actual GCash API
    // For now, simulate GCash payment processing
    const gcashPaymentResult = {
      success: true,
      reference_id: gcashReferenceId,
      transaction_id: `TXN-${Date.now()}`,
      status: 'succeeded'
    }

    console.log('Creating order in database...')
    const { data: order, error: orderError } = await supabaseClient
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

    console.log('Order created successfully:', order.id)
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

    await supabaseClient.from('order_items').insert(orderItems)
    console.log('Order items inserted')

    console.log('Creating payment transaction...')
    await supabaseClient.from('payment_transactions').insert({
      order_id: order.id,
      gcash_reference_id: gcashReferenceId,
      gateway_transaction_id: gcashPaymentResult.transaction_id,
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

    console.log('Payment transaction created')
    console.log('GCash payment processed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: orderNumber,
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