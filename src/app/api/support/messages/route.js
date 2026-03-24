import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('support_messages')
      .select('id, user_id, sender_id, sender_role, message, order_number, is_read_by_customer, is_read_by_admin, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('/api/support/messages error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch messages' }, { status: 500 });
  }
}
