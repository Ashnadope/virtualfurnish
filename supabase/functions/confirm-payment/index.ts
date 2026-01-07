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

    const { paymentIntentId } = await req.json()

    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: 'Payment Intent ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let orderStatus = 'pending'
    let paymentStatus = 'pending'

    switch (paymentIntent.status) {
      case 'succeeded':
        orderStatus = 'processing'
        paymentStatus = 'succeeded'
        break
      case 'requires_payment_method': case'requires_confirmation': case'requires_action':
        orderStatus = 'pending'
        paymentStatus = 'pending'
        break
      case 'canceled':
        orderStatus = 'cancelled'
        paymentStatus = 'cancelled'
        break
      default:
        orderStatus = 'pending'
        paymentStatus = 'pending'
    }

    await supabaseClient
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    await supabaseClient
      .from('payment_transactions')
      .update({
        status: paymentIntent.status,
        stripe_charge_id: paymentIntent.latest_charge,
        metadata: {
          stripe_payment_intent: paymentIntent,
          confirmed_at: new Date().toISOString()
        }
      })
      .eq('payment_intent_id', paymentIntentId)

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          ...order,
          status: orderStatus,
          payment_status: paymentStatus
        },
        payment_intent: paymentIntent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})