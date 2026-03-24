import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { message, order_number } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        user_id: user.id,
        sender_id: user.id,
        sender_role: 'customer',
        message: message.trim(),
        order_number: order_number || null,
        is_read_by_customer: true,
        is_read_by_admin: false,
      })
      .select('id, user_id, sender_id, sender_role, message, order_number, is_read_by_customer, is_read_by_admin, created_at')
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('/api/support/send error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to send message' }, { status: 500 });
  }
}
