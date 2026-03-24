import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST /api/products/upload-url
// Body: { ext: 'jpg' | 'png' | ... }
// Returns: { signedUrl, path, publicUrl }
export async function POST(request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { ext } = await request.json();
  const filePath = `products/variant-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext || 'jpg'}`;

  const { data, error } = await supabase.storage
    .from('furniture-images')
    .createSignedUploadUrl(filePath);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('furniture-images')
    .getPublicUrl(filePath);

  return Response.json({ signedUrl: data.signedUrl, path: filePath, publicUrl });
}
