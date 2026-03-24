-- Allow customers to cancel their own orders (pre-shipment only).
-- USING  → which existing rows can be targeted  (old status must not be shipped/delivered/cancelled)
-- WITH CHECK → what values the new row may contain (only status = 'cancelled' is permitted)
CREATE POLICY "Users can cancel own pre-shipment orders"
    ON public.orders
    FOR UPDATE
    USING (
        auth.uid() = user_id
        AND status NOT IN ('shipped', 'delivered', 'cancelled')
    )
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'cancelled'
    );

-- Allow admins to update any order (required for status management in admin dashboard).
CREATE POLICY "Admins can update any order"
    ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );
