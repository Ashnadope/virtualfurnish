-- =====================================================
-- PRODUCT RECOMMENDATIONS TABLE
-- Stores ML-computed per-user product scores.
-- Populated by: ml/recommender.py
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_recommendations (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID        NOT NULL REFERENCES public.user_profiles(id)  ON DELETE CASCADE,
    product_id       UUID        NOT NULL REFERENCES public.products(id)        ON DELETE CASCADE,
    -- Final blended score (0–1) used to sort the furniture catalog
    score            DECIMAL(10,6) NOT NULL DEFAULT 0,
    -- Component scores kept for transparency / future tuning
    ai_score         DECIMAL(10,6) NOT NULL DEFAULT 0,   -- from room-design AI analysis
    cf_score         DECIMAL(10,6) NOT NULL DEFAULT 0,   -- from co-purchase / co-wishlist
    popularity_score DECIMAL(10,6) NOT NULL DEFAULT 0,   -- global interaction frequency
    computed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT product_recommendations_user_product_unique UNIQUE (user_id, product_id)
);

-- Fast lookup: all recommendations for a user ordered by relevance
CREATE INDEX IF NOT EXISTS idx_product_rec_user_score
    ON public.product_recommendations (user_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_product_rec_product
    ON public.product_recommendations (product_id);

CREATE INDEX IF NOT EXISTS idx_product_rec_computed_at
    ON public.product_recommendations (computed_at DESC);

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read only their own recommendations
CREATE POLICY "users_read_own_recommendations"
    ON public.product_recommendations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Service role (used by the Python script) has unrestricted access
CREATE POLICY "service_role_manages_recommendations"
    ON public.product_recommendations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
