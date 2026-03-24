import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { addressId, firstName, lastName, address_line_1, address_line_2, city, state, postal_code, country, phone } = body;

    const addressRow = {
      ...(addressId ? { id: addressId } : {}),
      user_id: user.id,
      type: 'billing',
      first_name: firstName ?? '',
      last_name: lastName ?? '',
      address_line_1,
      address_line_2: address_line_2 ?? null,
      city,
      state,
      postal_code,
      country: country ?? 'PH',
      phone: phone ?? null,
      is_default: true,
    };

    const { data, error } = await supabase
      .from('addresses')
      .upsert(addressRow, { onConflict: 'id' })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('/api/checkout/save-address error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to save address' }, { status: 500 });
  }
}
