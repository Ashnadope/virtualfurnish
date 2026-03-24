import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('support_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_role', 'customer')
      .eq('is_read_by_admin', false);

    if (error) throw error;

    return NextResponse.json({ count: count ?? 0 });
  } catch (err) {
    console.error('Error fetching admin unread support count:', err);
    return NextResponse.json({ count: 0 });
  }
}
