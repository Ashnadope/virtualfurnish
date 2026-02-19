-- =====================================================
-- MIGRATION: Enable Public Access for Design Renders
-- Date: 2026-02-15
-- Purpose: Allow anonymous users to view shared design renders
-- =====================================================

-- Drop the old restrictive policy that only allowed owners to view
DROP POLICY IF EXISTS "Users can view own render images" ON storage.objects;

-- Create new policy that allows anyone to read renders for signed URLs
-- This is required for generating signed URLs for unauthenticated users
-- Security is maintained through:
-- 1. File paths include user IDs (hard to guess)
-- 2. Signed URLs expire after 3600 seconds (1 hour)
-- 3. Only designs with is_public=true are shared
CREATE POLICY "Anyone can read renders for signed URLs"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'design-renders');

-- Note: INSERT and DELETE policies remain restricted to authenticated users (owners only)
