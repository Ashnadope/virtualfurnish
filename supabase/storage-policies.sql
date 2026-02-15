-- =====================================================
-- SUPABASE STORAGE POLICIES
-- Run these AFTER creating the storage buckets
-- =====================================================

-- =====================================================
-- BUCKET: room-uploads (Private)
-- Stores customer uploaded room photos
-- =====================================================

-- Policy 1: Users can upload their own room images
CREATE POLICY "Users can upload own room images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'room-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own room images
CREATE POLICY "Users can view own room images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'room-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own room images
CREATE POLICY "Users can update own room images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'room-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own room images
CREATE POLICY "Users can delete own room images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'room-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- BUCKET: design-renders (Private - Optional)
-- Stores generated composite images
-- =====================================================

-- Policy 1: Users can upload their own render images
CREATE POLICY "Users can upload own render images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-renders' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own render images
CREATE POLICY "Users can view own render images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'design-renders' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own render images
CREATE POLICY "Users can delete own render images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'design-renders' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- BUCKET: furniture-images (Public)
-- Stores product catalog images
-- =====================================================

-- Policy 1: Authenticated users can upload furniture images
CREATE POLICY "Authenticated users can upload furniture images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'furniture-images');

-- Policy 2: Anyone can view furniture images (public bucket)
CREATE POLICY "Anyone can view furniture images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'furniture-images');

-- Policy 3: Authenticated users can update furniture images
CREATE POLICY "Authenticated users can update furniture images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'furniture-images');

-- Policy 4: Authenticated users can delete furniture images
CREATE POLICY "Authenticated users can delete furniture images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'furniture-images');
