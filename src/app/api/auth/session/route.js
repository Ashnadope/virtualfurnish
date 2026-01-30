import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const supabase = await createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  return Response.json({
    hasSession: !!session,
    user: session?.user || null,
    error: error?.message || null
  });
}
