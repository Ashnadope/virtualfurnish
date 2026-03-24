import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST /api/room-designer/upload-url
// Body: FormData with field 'file' and 'prefix' ('room' | 'ai')
// Returns: { viewUrl, filePath }
//
// Receives the file here and uploads it with the service role key, which
// bypasses RLS and never expires — fixes the browser-token stale/timeout bug.
export async function POST(request) {
  // Auth check via cookie-based server client (verifies user is logged in)
  const serverSupabase = await createServerClient();
  const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');
  const prefix = formData.get('prefix') || 'room';

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name?.split('.').pop() || 'jpg';
  const filePath = `${user.id}/${prefix}-${Date.now()}.${ext}`;

  // Service role client — bypasses RLS, token never expires
  const adminSupabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await adminSupabase.storage
    .from('room-uploads')
    .upload(filePath, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  // Signed view URL valid for 1 hour so the browser can display the private image
  const { data: urlData, error: urlError } = await adminSupabase.storage
    .from('room-uploads')
    .createSignedUrl(filePath, 3600);

  if (urlError) return Response.json({ error: urlError.message }, { status: 500 });

  return Response.json({ viewUrl: urlData.signedUrl, filePath });
}
