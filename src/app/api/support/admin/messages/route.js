import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function requireAdmin(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin' ? user : null;
}

/**
 * GET /api/support/admin/messages?userId=<customerId>
 * Fetch the full message thread for a customer.
 */
export async function GET(request) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('support_messages')
    .select('id, user_id, sender_id, sender_role, message, order_id, order_number, is_read_by_customer, is_read_by_admin, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ messages: data ?? [] });
}

/**
 * POST /api/support/admin/messages
 * Admin sends a reply in a customer's thread.
 * Body: { userId: string, message: string }
 */
export async function POST(request) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { userId, message } = body ?? {};
  if (!userId || !message?.trim()) {
    return Response.json({ error: 'userId and message are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      user_id: userId,
      sender_id: admin.id,
      sender_role: 'admin',
      message: message.trim(),
      is_read_by_customer: false,
      is_read_by_admin: true,
    })
    .select('id, user_id, sender_id, sender_role, message, order_id, order_number, is_read_by_customer, is_read_by_admin, created_at')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ message: data });
}
