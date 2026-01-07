-- Location: supabase/migrations/20260107024234_wishlist_module.sql
-- Schema Analysis: Existing tables include products, user_profiles, cart_items, orders
-- Integration Type: New module addition
-- Dependencies: products (id), user_profiles (id)

-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE INDEX idx_wishlist_items_created_at ON public.wishlist_items(created_at DESC);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own wishlist items
CREATE POLICY "users_manage_own_wishlist_items"
ON public.wishlist_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Mock data for wishlist items (reference existing products and users)
DO $$
DECLARE
    existing_user_id UUID;
    product_id_1 UUID;
    product_id_2 UUID;
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Get existing product IDs
    SELECT id INTO product_id_1 FROM public.products LIMIT 1;
    SELECT id INTO product_id_2 FROM public.products LIMIT 1 OFFSET 1;
    
    -- Add wishlist items for existing user
    IF existing_user_id IS NOT NULL AND product_id_1 IS NOT NULL AND product_id_2 IS NOT NULL THEN
        INSERT INTO public.wishlist_items (user_id, product_id)
        VALUES
            (existing_user_id, product_id_1),
            (existing_user_id, product_id_2)
        ON CONFLICT (user_id, product_id) DO NOTHING;
    END IF;
END $$;