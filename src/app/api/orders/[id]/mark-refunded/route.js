import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const supabase = await createClient();

  // Verify admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const orderId = params.id;

  // Confirm order exists and is in refund_pending state
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return Response.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.payment_status !== 'refund_pending') {
    return Response.json(
      { error: `Order payment status is '${order.payment_status}', not 'refund_pending'.` },
      { status: 422 }
    );
  }

  // Mark the order as refunded
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ payment_status: 'refunded', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('id, payment_status, updated_at')
    .single();

  if (updateError) {
    console.error('Mark refunded error:', updateError);
    return Response.json({ error: 'Failed to update payment status.' }, { status: 500 });
  }

  // Also mark the refund transaction row as succeeded
  await supabase
    .from('payment_transactions')
    .update({ status: 'succeeded' })
    .eq('order_id', orderId)
    .eq('transaction_type', 'refund');

  return Response.json({ data: updated });
}
