import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const NON_CANCELLABLE = ['shipped', 'delivered', 'cancelled'];

export async function POST(request, { params }) {
  const supabase = await createClient();

  // Verify authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = params.id;

  // Fetch the order — confirm ownership & current status
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, user_id, payment_status, stock_allocated')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return Response.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (NON_CANCELLABLE.includes(order.status?.toLowerCase())) {
    return Response.json(
      { error: `Order cannot be cancelled because it is already ${order.status}.` },
      { status: 422 }
    );
  }

  // ── Issue refund via edge function (if payment was collected) ──────────────
  let refundStatus = null;
  let refundGateway = null;

  if (order.payment_status === 'succeeded') {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const refundRes = await fetch(
        `${supabaseUrl}/functions/v1/process-refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Use service role key for trusted server-to-server call.
            // The cancel route has already verified user ownership above.
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      // Try to parse JSON — non-deployed functions return HTML which throws here
      let refundJson = {};
      try {
        refundJson = await refundRes.json();
      } catch {
        // Non-JSON body (e.g. HTML 404 from gateway) — treat as refund pending
        console.warn('process-refund returned non-JSON response; flagging as refund_pending');
        refundStatus = 'refund_pending';
        refundGateway = null;
      }

      if (refundStatus === null) {
        if (refundRes.ok) {
          refundStatus = refundJson.refundStatus; // 'refunded' | 'refund_pending'
          refundGateway = refundJson.gateway;
        } else {
          // Edge function returned an error — flag for manual processing, don't block cancel
          console.error('process-refund error:', refundJson);
          refundStatus = 'refund_pending';
          refundGateway = null;
        }
      }
    } catch (err) {
      // Network failure or other error — flag for manual processing, don't block cancel
      console.error('Refund request failed (non-blocking):', err);
      refundStatus = 'refund_pending';
      refundGateway = null;
    }
  }

  // ── Cancel the order ───────────────────────────────────────────────────────
  const updateFields = {
    status: 'cancelled',
    updated_at: new Date().toISOString(),
    stock_allocated: false,
    // Write refund_pending locally when edge function was unreachable/failed
    ...(refundStatus ? { payment_status: refundStatus } : {}),
  };

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update(updateFields)
    .eq('id', orderId)
    .select('id, status, payment_status, updated_at')
    .single();

  if (updateError) {
    console.error('Cancel order error:', updateError);
    return Response.json({ error: 'Failed to cancel order.' }, { status: 500 });
  }

  // Restore stock for all items in the cancelled order.
  // adjust_variant_stock / adjust_product_stock use SECURITY DEFINER so they
  // bypass RLS and can be called with the user's JWT-based client.
  if (order.stock_allocated) {
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('variant_id, product_id, quantity')
        .eq('order_id', orderId);

      for (const item of (items ?? [])) {
        if (item.variant_id) {
          await supabase.rpc('adjust_variant_stock', {
            p_variant_id: item.variant_id,
            p_delta: item.quantity,
          });
        } else if (item.product_id) {
          await supabase.rpc('adjust_product_stock', {
            p_product_id: item.product_id,
            p_delta: item.quantity,
          });
        }
      }
    } catch (err) {
      // Non-fatal — order is already cancelled; log and continue
      console.error('Stock restore error for order', orderId, ':', err);
    }
  }

  return Response.json({
    data: updated,
    refundStatus,
    refundGateway,
    message:
      refundGateway === 'gcash'
        ? 'Order cancelled. Your GCash refund will be processed manually within 3–5 business days.'
        : refundStatus === 'refunded'
        ? 'Order cancelled and refund issued to your original payment method.'
        : refundStatus === 'refund_pending'
        ? 'Order cancelled. Refund is being processed.'
        : 'Order cancelled.',
  });
}
