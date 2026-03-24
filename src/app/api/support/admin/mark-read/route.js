import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/support/admin/mark-read
 * Mark all customer messages in a thread as read by admin.
 * Body: { userId: string }
 */
export async function POST(request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });

  await supabase
    .from('support_messages')
    .update({ is_read_by_admin: true })
    .eq('user_id', userId)
    .eq('sender_role', 'customer')
    .eq('is_read_by_admin', false);

  return Response.json({ success: true });
}
