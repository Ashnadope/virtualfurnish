import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST /api/room-designer/designs
// Body: { room_image_url: string, name?: string }
// Returns: { data: { id, ... } }
//
// Creates the room_designs record server-side so the session is always fresh.
export async function POST(request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { room_image_url, name } = await request.json();
  if (!room_image_url) return Response.json({ error: 'room_image_url is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('room_designs')
    .insert([{
      user_id: user.id,
      name: name || `Room Design - ${new Date().toLocaleDateString()}`,
      room_image_url,
      design_data: { furniture: [] },
      is_public: false,
    }])
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data });
}
