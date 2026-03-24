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
 * GET /api/support/admin/threads
 * Returns all customer support threads, one entry per customer,
 * sorted by most recent message descending.
 */
export async function GET() {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch all messages ordered newest-first
  const { data: msgs, error } = await supabase
    .from('support_messages')
    .select('id, user_id, sender_role, message, is_read_by_admin, created_at')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Build thread map keyed by user_id
  const threadMap = new Map();
  for (const msg of (msgs ?? [])) {
    const uid = msg.user_id;
    if (!threadMap.has(uid)) {
      threadMap.set(uid, {
        userId: uid,
        customer: null,
        lastMessage: msg.message,
        lastSenderRole: msg.sender_role,
        lastMessageAt: msg.created_at,
        unreadCount: 0,
      });
    }
    if (msg.sender_role === 'customer' && !msg.is_read_by_admin) {
      threadMap.get(uid).unreadCount += 1;
    }
  }

  // Fetch profiles for all unique user IDs
  const userIds = Array.from(threadMap.keys());
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds);

    for (const p of (profiles ?? [])) {
      const thread = threadMap.get(p.id);
      if (thread) {
        const fullName = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || p.id;
        thread.customer = { fullName, email: p.email ?? null };
      }
    }
  }

  // Fill in fallback for profiles not found
  for (const thread of threadMap.values()) {
    if (!thread.customer) thread.customer = { fullName: thread.userId, email: null };
  }

  const threads = Array.from(threadMap.values())
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

  return Response.json({ threads });
}
