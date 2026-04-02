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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentIntentId = body?.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase.functions.invoke('confirm-payment', {
      body: { paymentIntentId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('/api/checkout/confirm-payment invoke error:', error);
      let detail = '';
      if (error?.context instanceof Response) {
        try {
          detail = await error.context.text();
        } catch (_) {
          detail = '';
        }
      }

      const combinedError = `${detail || ''} ${error?.message || ''}`.toLowerCase();
      const functionMissing = combinedError.includes('requested function was not found')
        || combinedError.includes('not_found');

      if (functionMissing) {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
          return NextResponse.json(
            { error: 'confirm-payment function is missing and fallback is not configured (missing STRIPE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY).' },
            { status: 502 }
          );
        }

        const stripeRes = await fetch(
          `https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
            },
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

        const { data: order, error: orderLookupError } = await adminSupabase
          .from('orders')
          .select('id, order_number, user_id')
          .eq('payment_intent_id', paymentIntentId)
          .eq('user_id', user.id)
          .single();

        if (orderLookupError || !order) {
          return NextResponse.json(
            { error: 'Order not found for payment confirmation fallback' },
            { status: 404 }
          );
        }

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
            { error: orderUpdateError.message || 'Failed to update order in fallback confirmation' },
            { status: 502 }
          );
        }

        await adminSupabase
          .from('payment_transactions')
          .update({
            status: stripePayload?.status || paymentStatus,
            stripe_charge_id: stripePayload?.latest_charge || null,
            metadata: {
              stripe_payment_intent_id: stripePayload?.id,
              confirmed_via: 'next-api-fallback',
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
          via: 'fallback',
        });
      }

      return NextResponse.json(
        { error: detail || error.message || 'Failed to confirm payment' },
        { status: 502 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        { error: 'Payment confirmation returned unsuccessful response' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('/api/checkout/confirm-payment error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
