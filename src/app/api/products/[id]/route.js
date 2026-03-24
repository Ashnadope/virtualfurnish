import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// ── SKU helpers ────────────────────────────────────────────────────────────
function normalizeColor(color) {
  return (color || 'DEFAULT')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function requireAdmin(supabase, user) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin';
}

function mapVariant(v) {
  return {
    id: v.id,
    sku: v.sku,
    color: v.color,
    price: v.price,
    stockQuantity: v.stock_quantity,
    dimensions: v.dimensions,
    material: v.material,
    weight: v.weight,
    imageUrl: v.image_url,
    isActive: v.is_active,
    productId: v.product_id,
  };
}

// ── PUT /api/products/[id] — update product + variants ───────────────────
export async function PUT(request, { params }) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await requireAdmin(supabase, user))) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const productId = params.id;
  const productData = await request.json();
  const submittedVariants = productData?.variants || [];
  const isActive = productData?.status === 'active';
  const firstVariant = submittedVariants[0];

  // 1. Update product row
  const { data: product, error: productError } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description,
      brand: productData.brand || null,
      category: productData.category,
      base_price: parseFloat(firstVariant?.price ?? 0),
      image_alt: productData.imageAlt,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single();

  if (productError) return Response.json({ error: productError.message }, { status: 500 });

  // 2. Fetch existing variant IDs to detect deletions
  const { data: existingVariants, error: fetchError } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId);

  if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 });

  const existingIds = (existingVariants || []).map(v => v.id);
  const submittedIds = submittedVariants.filter(v => v.id).map(v => v.id);
  const idsToDelete = existingIds.filter(id => !submittedIds.includes(id));

  // 3. Delete removed variants
  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .in('id', idsToDelete);
    if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });
  }

  const buildRow = (v, includeId = false) => ({
    ...(includeId ? { id: v.id } : {}),
    product_id: productId,
    name: v.color || productData.name,
    // For existing variants keep their SKU; for new ones generate from product SKU + color
    sku: v.id ? (v.sku || null) : `${product.sku}-${normalizeColor(v.color)}`,
    color: v.color,
    price: parseFloat(v.price || 0),
    stock_quantity: parseInt(v.stock_quantity || 0),
    dimensions: v.dimensions || null,
    material: v.material || null,
    weight: v.weight ? String(v.weight) : null,
    image_url: v.image || null,
  });

  let upsertedVariants = [];

  // 4a. Upsert existing variants
  const toUpdate = submittedVariants.filter(v => v.id);
  if (toUpdate.length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from('product_variants')
      .upsert(toUpdate.map(v => buildRow(v, true)), { onConflict: 'id' })
      .select();
    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });
    upsertedVariants = upsertedVariants.concat(updated || []);
  }

  // 4b. Insert new variants
  const toInsert = submittedVariants.filter(v => !v.id);
  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('product_variants')
      .insert(toInsert.map(v => buildRow(v, false)))
      .select();
    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });
    upsertedVariants = upsertedVariants.concat(inserted || []);
  }

  const mappedVariants = upsertedVariants.map(mapVariant);
  const prices = mappedVariants.map(v => v.price).filter(Boolean).sort((a, b) => a - b);
  const totalStock = mappedVariants.reduce((s, v) => s + (v.stockQuantity || 0), 0);

  return Response.json({
    data: {
      id: product.id,
      name: product.name,
      brand: product.brand,
      sku: product.sku,
      category: product.category,
      price: prices[0] ?? 0,
      stock: totalStock,
      status: product.is_active ? 'active' : 'inactive',
      description: product.description,
      imageAlt: product.image_alt,
      image: mappedVariants[0]?.imageUrl || null,
      variants: mappedVariants,
    },
  });
}

// ── DELETE /api/products/[id] — soft-archive single product ─────────────
export async function DELETE(request, { params }) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await requireAdmin(supabase, user))) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // Soft-delete: mark as archived instead of hard delete so order history stays intact
  const { error } = await supabase
    .from('products')
    .update({ is_archived: true })
    .eq('id', params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Remove from active carts and wishlists so customers don't see stale items
  await supabase.from('cart_items').delete().eq('product_id', params.id);
  await supabase.from('wishlist_items').delete().eq('product_id', params.id);

  return Response.json({ success: true });
}
