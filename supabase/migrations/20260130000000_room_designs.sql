-- =====================================================
-- ROOM DESIGNS MODULE
-- Store customer room photos and furniture placements
-- Generated: 2026-01-30
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ROOM DESIGNS TABLE
-- Stores customer room designs with furniture placements
-- =====================================================
CREATE TABLE IF NOT EXISTS room_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    room_image_url TEXT, -- URL to uploaded room photo in Supabase Storage
    render_url TEXT, -- Optional: URL to rendered composite image
    design_data JSONB NOT NULL DEFAULT '{"roomDimensions": {}, "furniture": []}'::jsonb,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE, -- Allow public viewing via share link
    share_token TEXT UNIQUE, -- Unique token for shareable link
    view_count INTEGER DEFAULT 0, -- Track how many times design was viewed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for design_data structure
COMMENT ON COLUMN room_designs.design_data IS 'JSON structure: {roomDimensions: {width, height}, furniture: [{productId, variantId, position: {x, y}, rotation, scale, zIndex}]}';

-- Create indexes for performance
CREATE INDEX idx_room_designs_user_id ON room_designs(user_id);
CREATE INDEX idx_room_designs_created_at ON room_designs(created_at DESC);
CREATE INDEX idx_room_designs_is_favorite ON room_designs(is_favorite) WHERE is_favorite = true;

-- Enable RLS
ALTER TABLE room_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own room designs
CREATE POLICY "users_manage_own_designs"
ON room_designs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can view their own designs
CREATE POLICY "users_view_own_designs"
ON room_designs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policy: Anyone can view public designs (for sharing)
CREATE POLICY "anyone_view_public_designs"
ON room_designs
FOR SELECT
TO public
USING (is_public = true);

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate share_token when is_public is set to true
CREATE OR REPLACE FUNCTION set_share_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_public = true AND NEW.share_token IS NULL THEN
        NEW.share_token := generate_share_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_share_token
BEFORE INSERT OR UPDATE ON room_designs
FOR EACH ROW
EXECUTE FUNCTION set_share_token();
